import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users  implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  activeTab: string = 'users';
  searchTerm: string = '';
  pendingTestimonialsCount: number = 0;
  showOrdersModal: boolean = false;
  showTestimonialsModal: boolean = false;
  selectedUser: any = null;
  userOrders: any[] = [];
  ordersLoading: boolean = false;
  userTestimonials: any[] = [];
  testimonialsLoading: boolean = false;
  selectedOrder: any = null;
  newStatus: string = '';
  selectedTestimonial: any = null;
  adminNotes: string = '';

constructor(private userService:UserService) {}
  ngOnInit(): void {
    this.loadUsers();
    this.loadTestimonialsCount();
  }
loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.users = response.data || [];
          this.filteredUsers = [...this.users];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
        this.loading = false;
      }
    });
  }
getOrderDisplay(order: any): string {
  if (!order) return 'N/A';
if (typeof order === 'object') {
    return order.orderNumber || order._id?.slice(-8) || 'N/A';
  }
if (typeof order === 'string') {
    return order.slice(-8);
  }

  return 'N/A';
}
  loadTestimonialsCount(): void {
    this.userService.getAllTestimonials('pending').subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.pendingTestimonialsCount = res.results || 0;
        }
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user._id?.toLowerCase().includes(term)
    );
  }
viewUserOrders(user: any): void {
    this.selectedUser = user;
    this.userOrders = [];
    this.showOrdersModal = true;
    this.loadUserOrders(user._id);
  }

  loadUserOrders(userId: string): void {
    this.ordersLoading = true;
    this.userService.getUserOrdersForAdmin(userId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.userOrders = response.data || [];
        }
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders';
        this.ordersLoading = false;
      }
    });
  }

  openUpdateStatusModal(order: any): void {
    this.selectedOrder = order;
    this.newStatus = order.status;
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || !this.newStatus) return;

    this.userService.updateOrderStatus(this.selectedOrder._id, this.newStatus)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            const index = this.userOrders.findIndex(o => o._id === this.selectedOrder._id);
            if (index !== -1) {
              this.userOrders[index].status = this.newStatus;
            }
            this.closeUpdateStatusModal();
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.errorMessage = 'Failed to update order status';
        }
      });
  }

  closeUpdateStatusModal(): void {
    this.selectedOrder = null;
    this.newStatus = '';
  }

  viewUserTestimonials(user: any): void {
    this.selectedUser = user;
    this.userTestimonials = [];
    this.showTestimonialsModal = true;
    this.loadUserTestimonials(user._id);
  }

  loadUserTestimonials(userId: string): void {
    this.testimonialsLoading = true;
    this.userService.getUserTestimonials(userId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.userTestimonials = response.data || [];
        }
        this.testimonialsLoading = false;
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.errorMessage = 'Failed to load testimonials';
        this.testimonialsLoading = false;
      }
    });
  }

  openApproveModal(testimonial: any): void {
    this.selectedTestimonial = testimonial;
    this.adminNotes = '';
  }

  openRejectModal(testimonial: any): void {
    this.selectedTestimonial = testimonial;
    this.adminNotes = '';
  }

  approveTestimonial(): void {
    if (!this.selectedTestimonial) return;

    this.userService.approveTestimonial(this.selectedTestimonial._id, this.adminNotes)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            const index = this.userTestimonials.findIndex(t => t._id === this.selectedTestimonial._id);
            if (index !== -1) {
              this.userTestimonials[index].status = 'approved';
              this.userTestimonials[index].isApproved = true;
            }
            this.closeTestimonialModal();
            this.loadTestimonialsCount();
          }
        },
        error: (error) => {
          console.error('Error approving testimonial:', error);
          this.errorMessage = 'Failed to approve testimonial';
        }
      });
  }

  rejectTestimonial(): void {
    if (!this.selectedTestimonial) return;

    this.userService.rejectTestimonial(this.selectedTestimonial._id, this.adminNotes)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
           const index = this.userTestimonials.findIndex(t => t._id === this.selectedTestimonial._id);
            if (index !== -1) {
              this.userTestimonials[index].status = 'rejected';
              this.userTestimonials[index].isApproved = false;
            }
            this.closeTestimonialModal();
            this.loadTestimonialsCount();
          }
        },
        error: (error) => {
          console.error('Error rejecting testimonial:', error);
          this.errorMessage = 'Failed to reject testimonial';
        }
      });
  }

  closeTestimonialModal(): void {
    this.selectedTestimonial = null;
    this.adminNotes = '';
  }

  closeOrdersModal(): void {
    this.showOrdersModal = false;
    this.selectedUser = null;
    this.userOrders = [];
  }

  closeTestimonialsModal(): void {
    this.showTestimonialsModal = false;
    this.selectedUser = null;
    this.userTestimonials = [];
  }

  editUser(user: any): void {
    console.log('Edit user:', user);

  }

  deleteUser(userId: string, userName: string): void {
    if (confirm(`Delete user: ${userName}?`)) {
      console.log('Delete user:', userId);

    }
  }

 
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'preparing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'returned': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getTestimonialStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
