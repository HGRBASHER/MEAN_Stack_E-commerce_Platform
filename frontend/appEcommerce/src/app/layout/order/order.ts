import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  orders: any[] = [];
  loading: boolean = true;
  error: string = '';
  selectedOrder: any = null;
  cancelReason: string = '';
  editingOrder: any = null;
  editingOrderId: string | null = null;
  editingItemId: string | null = null;
  newQuantity: number = 1;
  newAddress: string = '';
  newPhone: string = '';
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (response: any) => {
        this.orders = response.data || response.orders || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }
showCancelModal(order: any): void {
    this.selectedOrder = order;
    this.cancelReason = '';
  }

  closeModal(): void {
    this.selectedOrder = null;
    this.editingOrder = null;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (this.selectedOrder) {
      this.cancelOrder(this.selectedOrder._id, this.cancelReason);
      this.closeModal();
    }
  }

  startEdit(order: any): void {
    if (this.canEdit(order)) {
      this.editingOrder = order; 
      this.newAddress = order.address;
      this.newPhone = order.phone;
    }
  }
saveItemQuantity(orderId: string | null): void {
  if (!orderId) {
    this.error = 'No order selected for update.';
    return;
  }

  const order = this.orders.find(o => o._id === orderId);
  if (!order || !this.editingItemId) return;
const updatedItems = order.items.map((item: any) => {
    if (item.product._id === this.editingItemId) {
      return { ...item, quantity: Math.max(1, this.newQuantity) };
    }
    return item;
  });

  const updateData = {
    items: updatedItems.map((item: any) => ({
      productId: item.product._id,
      quantity: item.quantity
    })),
    address: order.address,
    phone: order.phone
  };

  this.orderService.updateOrder(orderId, updateData).subscribe({
    next: (response) => {
      if (response.status === 'success') {
        this.cancelEdit();
        this.loadOrders();
      }
    },
    error: (error) => {
      console.error('Error updating item:', error);
      this.error = 'Failed to update item quantity. Please try again.';
    }
  });
}
cancelOrder(orderId: string, cancelReason?: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId, cancelReason).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.error = 'Failed to cancel order. Please try again.';
        }
      });
    }
  }
cancelEdit(): void {
    this.selectedOrder = null;
    this.editingOrder = null;
    this.editingOrderId = null;
    this.editingItemId = null;
    this.newQuantity = 1;
    this.newAddress = '';
    this.newPhone = '';
    this.cancelReason = '';
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }
saveOrder(orderId: string): void {
    const order = this.orders.find(o => o._id === orderId);
    if (!order) return;

    const updatedItems = order.items.map((item: any) => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    const updateData = {
      items: updatedItems,
      address: this.newAddress,
      phone: this.newPhone
    };

    this.orderService.updateOrder(orderId, updateData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const index = this.orders.findIndex(o => o._id === orderId);
          if (index !== -1) {
            this.orders[index] = response.data;
          }
          this.cancelEdit();
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.error = 'Failed to update order. Please try again.';
      }
    });
  }

  removeItemFromOrder(orderId: string, productId: string): void {
    const order = this.orders.find(o => o._id === orderId);
    if (!order || !this.canEdit(order)) return;

    const updatedItems = order.items.filter((item: any) =>
      item.product._id !== productId
    );

    if (updatedItems.length === 0) {
      this.cancelOrder(orderId);
      return;
    }

    const updateData = {
      items: updatedItems.map((item: any) => ({
        productId: item.product._id,
        quantity: item.quantity
      })),
      address: order.address,
      phone: order.phone
    };

    this.orderService.updateOrder(orderId, updateData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.error = 'Failed to remove item from order. Please try again.';
      }
    });
  }

  canEdit(order: any): boolean {
    return order.status === 'pending' || order.status === 'preparing';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'preparing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateOrderTotal(order: any): number {
    if (order.totalPrice) return order.totalPrice;

    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total: number, item: any) => {
        const price = item.price || item.product?.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
    }

    return 0;
  }
  startEditItem(orderId: string, item: any): void {
  const order = this.orders.find(o => o._id === orderId);
  if (order && this.canEdit(order)) {
    this.editingOrderId = orderId;
    this.editingOrder = order;
    this.editingItemId = item.product?._id || item.productId;
    this.newQuantity = item.quantity || 1;
  }
}
}
