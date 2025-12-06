import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { OrderService } from '../../core/services/order.service';
import { StockIssue } from '../../core/models/checkout.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  userName: string = '';
  userEmail: string = '';
  cartItems: any[] = [];
  subtotal: number = 0;
  shippingCost: number = 0;
  totalPrice: number = 0;
  loading: boolean = true;
  checkingStock: boolean = false;
  placingOrder: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  stockIssues: StockIssue[] = [];
  hasStockIssues: boolean = false;

  checkoutForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9+-\s()]{10,}$/)
    ]),
    address: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('Egypt', [Validators.required]),
    paymentMethod: new FormControl('cash', [Validators.required]),
    notes: new FormControl('')
  });

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadCartData();
  }

private loadUserData(): void {
  this.authService.getUserData().subscribe(userData => {

    if (userData) {
      this.userName = userData.name || '';
      this.userEmail = userData.email || '';
      const savedUser = localStorage.getItem('userInfo');
      this.checkoutForm.patchValue({
        name: this.userName,
        email: this.userEmail,
      });
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
    }
  });
}
  private loadCartData(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.items || [];
          this.calculateTotals();

          if (this.cartItems.length === 0) {
            this.errorMessage = 'Your cart is empty. Please add items before checkout.';
            setTimeout(() => {
              this.router.navigate(['/cart']);
            }, 2000);
          } else {
            this.checkStock();
          }
        } else {
          this.errorMessage = response.message || 'Failed to load cart';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.errorMessage = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    });
  }
  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);

    this.shippingCost = this.subtotal * 0.01;
    this.totalPrice = this.subtotal + this.shippingCost;
  }

  checkStock(): void {
    if (this.cartItems.length === 0) return;

    this.checkingStock = true;
    this.errorMessage = '';
    this.stockIssues = [];
    this.hasStockIssues = false;

    const items = this.cartItems.map(item => ({
      productId: item.product?._id || item.productId,
      quantity: item.quantity || 1
    }));

    this.checkoutService.checkStock(items).subscribe({
      next: (response: any) => {
        this.checkingStock = false;
        if (response.status === 'success') {
          this.errorMessage = '';
          this.stockIssues = [];
          this.hasStockIssues = false;
        } else if (response.status === 'partial') {
          this.stockIssues = response.data?.stockIssues || [];
          this.hasStockIssues = this.stockIssues.length > 0;

          const issueMessages = this.stockIssues.map(issue =>
            `${issue.productName}: Available ${issue.available}, Requested ${issue.requested}`
          ).join('\n');

          this.errorMessage = `Stock issues:\n${issueMessages}\n\nPlease update your cart.`;
        }
      },
      error: (error) => {
        this.checkingStock = false;
        console.error('Error checking stock:', error);
        this.errorMessage = 'Failed to check stock availability.';
      }
    });
  }


  private performStockCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.cartItems.length === 0) {
        resolve(false);
        return;
      }

      this.checkingStock = true;
      const items = this.cartItems.map(item => ({
        productId: item.product?._id || item.productId,
        quantity: item.quantity || 1
      }));

      this.checkoutService.checkStock(items).subscribe({
        next: (response: any) => {
          this.checkingStock = false;
          if (response.status === 'success') {
            this.errorMessage = '';
            this.stockIssues = [];
            this.hasStockIssues = false;
            resolve(true);
          } else if (response.status === 'partial') {
            this.stockIssues = response.data?.stockIssues || [];
            this.hasStockIssues = this.stockIssues.length > 0;

            const issueMessages = this.stockIssues.map(issue =>
              `${issue.productName}: Available ${issue.available}, Requested ${issue.requested}`
            ).join('\n');

            this.errorMessage = `Stock issues:\n${issueMessages}\n\nPlease update your cart.`;
            resolve(false);
          }
        },
        error: (error) => {
          this.checkingStock = false;
          console.error('Error checking stock:', error);
          this.errorMessage = 'Failed to check stock availability.';
          resolve(false);
        }
      });
    });
  }
getProductName(item: any): string {
    return item.product?.name || item.name || 'Product';
  }
getProductPrice(item: any): number {
    return item.product?.price || item.price || 0;
  }
  async submitOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.markAllAsTouched();
      return;
    }
    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }
    const isStockValid = await this.performStockCheck();
    if (!isStockValid) {
      return;
    }
    this.placingOrder = true;
    this.errorMessage = '';
    const formValue = this.checkoutForm.value;
    const orderData = {
      items: this.cartItems.map(item => ({
        productId: item.product?._id || item.productId,
        quantity: item.quantity || 1
      })),
      address: `${formValue.address}, ${formValue.city}, ${formValue.country}`,
      phone: formValue.phone || '',
      paymentMethod: formValue.paymentMethod || 'cash'
    };
this.checkoutService.submitOrder(orderData).subscribe({
      next: (response) => {
        this.placingOrder = false;
        if (response.status === 'success') {
          this.cartService.clearCart().subscribe();
this.router.navigate(['/order'], {
            queryParams: { orderId: response.data.order._id },
          });
        }
        },error: (error) => {
        this.placingOrder = false;
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid order data.';
        } else if (error.status === 401) {
          this.errorMessage = 'Please login to place an order.';
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Failed to place order. Please try again.';
        }
      }
    });
  }
private markAllAsTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }
get name() { return this.checkoutForm.get('name'); }
  get email() { return this.checkoutForm.get('email'); }
  get phone() { return this.checkoutForm.get('phone'); }
  get address() { return this.checkoutForm.get('address'); }
  get city() { return this.checkoutForm.get('city'); }
  get country() { return this.checkoutForm.get('country'); }
  get paymentMethod() { return this.checkoutForm.get('paymentMethod'); }
goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
continueShopping(): void {
    this.router.navigate(['/products']);
  }
goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }
}
