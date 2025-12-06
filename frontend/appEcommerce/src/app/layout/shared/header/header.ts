import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  userName: string = '';
  cartItemCount: number = 0;

  constructor(private authService:AuthService, private cartService: CartService){}
  ngOnInit(): void {
    this.authService.getUserData().subscribe(userData => {
      if (userData) {
        this.userName = userData.name || '';
        this.loadCart();
    } else {
        this.userName = '';
        this.cartItemCount = 0;
      }
    });
}
private loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartService.updateCartCount(response.items.length || 0);
        }
      },
      error: (error) => {
      }
    });
    this.cartService.getCartCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }
logout(): void {
    this.authService.logout();
  }
  isAdmin() {
    return this.authService.isAuthenticateAdmin();
  }
}


