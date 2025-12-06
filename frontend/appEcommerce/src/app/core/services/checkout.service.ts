import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
private apiURL = environment.apiURL + '/order';

constructor(private http: HttpClient,private authService: AuthService) {}

private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }
  submitOrder(orderData: any): Observable<any> {
    return this.http.post(
      `${this.apiURL}`,
      orderData,
      { headers: this.getHeaders() }
    );
  }

  checkStock(items: any[]): Observable<any> {
    return this.http.post(
      `${this.apiURL}/check-stock`,
      { items },
      { headers: this.getHeaders() }
    );
  }
}

