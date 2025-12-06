import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
 private apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/my-orders`, { headers: this.getHeaders() });
  }

  submitOrder(orderData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/order`,
      orderData,
      { headers: this.getHeaders() }
    );
  }

  checkStock(items: any[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/order/check-stock`,
      { items },
      { headers: this.getHeaders() }
    );
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/order/${id}`,
      { headers: this.getHeaders() }
    );
  }

updateOrder(orderId: string, orderData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/order/user/${orderId}`,
      orderData,
      { headers: this.getHeaders() }
    );
  }
  cancelOrder(orderId: string, cancelReason?: string): Observable<any> {
    const body = cancelReason ? { cancelReason } : {};
    return this.http.delete(
      `${this.apiUrl}/order/user/${orderId}`,
      {
        headers: this.getHeaders(),
        body: body
      }
    );
  }
}
