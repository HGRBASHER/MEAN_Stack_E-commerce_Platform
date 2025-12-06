import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import { ICartResponse } from '../models/cart.model';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of , BehaviorSubject} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CartService {
private apiURL = environment.apiURL + '/cart';
private cartCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
getCartCount(): Observable<number> {return this.cartCountSubject.asObservable();}

updateCartCount(count: number): void {this.cartCountSubject.next(count);}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return headers;
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const headers = this.getHeaders();

    return this.http.post(
      this.apiURL + '/add',
      { productId, quantity },
      { headers }
    ).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.getCart().subscribe();
        }
      })
    );
  }

  getCart(): Observable<any> {
    const headers = this.getHeaders();

    return this.http.get(this.apiURL + '/me', { headers }).pipe(
      map((response: any) => {
        if (response.status === 'success') {
          if (response.data) {
            let itemsCount = 0;
          if (response.data.items && Array.isArray(response.data.items)) {
            itemsCount = response.data.items.length;
          } else if (response.data.products && Array.isArray(response.data.products)) {
            itemsCount = response.data.products.length;
          }
          this.updateCartCount(itemsCount);
          return {
              success: true,
              items: response.data.items || response.data.products || [],
              total: response.data.total || 0,
              shippingCost: response.data.total * 0.01 || 0,
              totalPrice: response.data.total +( response.data.total * 0.01 )|| 0,
              cartId: response.data.cartId || response.data._id,
              message: response.message
            };
          }
        }

        this.updateCartCount(0);
        return {
          success: true,
          items: [],
          total: 0,
          shippingCost: 0,
          totalPrice: 0,
          cartId: null,
          message: response.message || 'Cart is empty'
        };
      }),
      catchError(error => {
        console.error('Cart service error:', error);
        return of({
          success: false,
          items: [],
          total: 0,
          message: error.error?.message || 'Failed to load cart'
        });
      })
    );
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    const headers = this.getHeaders();

    return this.http.put(
      this.apiURL + '/update',
      { productId, quantity },
      { headers }
    ).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.getCart().subscribe();
        }
      })
    );
  }

  removeFromCart(productId: string): Observable<any> {
    const headers = this.getHeaders();

    return this.http.delete(`${this.apiURL}/remove/${productId}`, {
      headers,

    }).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.getCart().subscribe();
        }
      })
    );
  }

  clearCart(): Observable<any> {
    const headers = this.getHeaders();

    return this.http.delete(this.apiURL + '/clear', { headers }).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.updateCartCount(0);
        }
      })
    );
  }
}
