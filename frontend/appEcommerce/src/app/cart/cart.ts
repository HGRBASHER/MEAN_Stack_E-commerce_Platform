import { Component, OnInit } from '@angular/core';
import { CartService } from '../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../enviroments/environment';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  shippingCost : number = 0;
  totalPrice: number = 0;
  loading: boolean = true;
  errorMessage: string = '';
  cartId: string = '';
  apiURL = environment.apiURL;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.items || [];
          this.total = response.total || 0;
          this.shippingCost = this.total * 0.01 || 0;
          this.totalPrice = this.total + this.shippingCost;
          this.cartId = response.cartId || '';
          this.cartService.updateCartCount(this.cartItems.length);
        } else {
          this.errorMessage = response.message || 'Failed to load cart';
        }
        this.loading = false;
      },
      error: (error) => {
              console.error('Error loading cart:', error);
        if (error.status === 401) {
          this.errorMessage = 'Please login to view your cart';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load cart';
        }
        this.loading = false;
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  goToProducts() {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      return;
    }
    this.router.navigate(['/checkout']);
  }
  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity < 1) return;
    const productId = this.getProductId(item);
    this.cartService.updateCartItem(productId, newQuantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error updating item:', error);
      }
    });
  }

removeItem(item: any): void {
  const productId = item.product._id;
  this.cartService.removeFromCart(productId).subscribe({
    next: () => {
      this.loadCart();
    },
    error: (error) => {
      console.error('Error removing item:', error);
    }
  });
}

  clearCart(): void {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cartItems = [];
          this.total = 0;
          this.shippingCost = 0;
          this.totalPrice = 0;
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
        }
      });
    }
  }
  getProductId(item: any): string {
    return item.product?._id || '';
  }

  getProductName(item: any): string {
    return item.product?.name || item.name || 'Product';
  }

  getProductPrice(item: any): number {
    return item.product?.price || item.price || 0;
  }

getProductImage(item: any): string {
if (item.product) {
if (item.product.imgURL) {
            const url = item.product.imgURL;
            return this.processImageUrl(url);
        }if (item.product.image) {
            const url = item.product.image;
            return this.processImageUrl(url);
        }
    }
        if (item.imgURL) {
        return this.processImageUrl(item.imgURL);
    }
    return '';
}

private processImageUrl(url: string): string {
    if (!url) return '';
if (url.startsWith('http') || url.startsWith('https')) {
        return url;
    }
if (url.startsWith('/')) {
        const uploadsUrl = 'http://localhost:3000/uploads' + url;
        return uploadsUrl;
    }
    const defaultUrl = 'http://localhost:3000/uploads/' + url;
    return defaultUrl;
}
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '';
  }

}
