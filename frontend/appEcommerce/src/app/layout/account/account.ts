import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { TestimonailService } from '../../core/services/testimonail.service';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  user: any = null;
  userOrders: any[] = [];
  myTestimonials: any[] = [];
loading: boolean = true;
  loadingOrders: boolean = true;
  loadingTestimonials: boolean = true;
errorMessage: string = '';
  successMessage: string = '';
editMode: 'profile' | 'password' | null = null;

  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });
reviewForm = new FormGroup({
    orderId: new FormControl(''),
    rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  selectedOrderForReview: any = null;
  showReviewModal: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private testimonialService: TestimonailService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserOrders();
    this.loadMyTestimonials();
  }
 loadUserData(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.user = response.data;
          this.profileForm.patchValue({
            name: this.user.name,
            email: this.user.email,
            });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile data';
        this.loading = false;
      }
    });
  }
loadUserOrders(): void {
    this.loadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.userOrders = response.data || [];
        }
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loadingOrders = false;
      }
    });
  }
loadMyTestimonials(): void {
    this.loadingTestimonials = true;
    this.testimonialService.getMyTestimonials().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.myTestimonials = response.data || [];
        }
        this.loadingTestimonials = false;
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.loadingTestimonials = false;
      }
    });
  }
 updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormTouched(this.profileForm);
      return;
    }

    const profileData = this.profileForm.value;
    this.userService.updateProfile(profileData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.user = response.data;
          this.successMessage = 'Profile updated successfully';
          this.editMode = null;
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile';
      }
    });
  }
changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormTouched(this.passwordForm);
      return;
    }

    const passwordData = this.passwordForm.value;

   if (passwordData.newPassword !== passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match';
      return;
    }

    this.userService.updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Password changed successfully';
          this.passwordForm.reset();
          this.editMode = null;
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.errorMessage = error.error?.message || 'Failed to change password';
      }
    });
  }

 openReviewForm(order: any): void {
  if (order.status !== 'delivered' && order.status !== 'returned' ) {
      this.errorMessage = 'You can only review delivered or returned orders';
      return;
    }
const existingTestimonial = this.myTestimonials.find(
      (t: any) => t.order?._id === order._id || t.order === order._id
    );

    if (existingTestimonial) {
      this.errorMessage = 'You have already submitted a review for this order';
      return;
    }

    this.selectedOrderForReview = order;
    this.reviewForm.patchValue({
      orderId: order._id,
      rating: 5,
      comment: ''
    });
    this.showReviewModal = true;
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.markFormTouched(this.reviewForm);
      return;
    }
    const formValue = this.reviewForm.value;
    const reviewData = {
    orderId: formValue.orderId!,
    rating: formValue.rating!,
    comment: formValue.comment!
  };
    this.testimonialService.addTestimonial(reviewData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Review submitted successfully! It will be reviewed by admin.';
          this.selectedOrderForReview = null;
          this.showReviewModal = false;
          this.reviewForm.reset();
          this.loadMyTestimonials();
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('Error adding review:', error);
        this.errorMessage = error.error?.message || 'Failed to submit review';
      }
    });
  }


  canAddReview(order: any): boolean {
    if (order.status !== 'delivered' && order.status !== 'returned') {
      return false;
    }


    return !this.myTestimonials.some(
      (t: any) => t.order?._id === order._id || t.order === order._id
    );
  }


  getTestimonialStatus(order: any): string {
    const testimonial = this.myTestimonials.find(
      (t: any) => t.order?._id === order._id || t.order === order._id
    );

    if (!testimonial) return '';

    switch (testimonial.status) {
      case 'pending': return ' Pending Review';
      case 'approved': return ' Approved';
      case 'rejected': return 'Rejected';
      default: return testimonial.status;
    }
  }


  private markFormTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormTouched(control);
      }
    });
  }

   cancelEdit(): void {
    this.editMode = null;
    this.profileForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      });
    this.passwordForm.reset();
    this.errorMessage = '';
  }


  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedOrderForReview = null;
    this.reviewForm.reset();
  }


  logout(): void {
    this.authService.logout();
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
}
