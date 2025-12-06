import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import { IUsersResponse} from '../models/user.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
constructor(private http: HttpClient,private _authService:AuthService) {}

  apiUrl = environment.apiURL + '/user';

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    });
  }
  private getHeaders(): HttpHeaders {
    const token = this._authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/me`,
      profileData,
      { headers: this.getHeaders() }
    );
  }
    getAllTestimonials(status?: string): Observable<any> {
    const url = status
      ? `${this.apiUrl}/testimonials/all?status=${status}`
      : `${this.apiUrl}/testimonials/all`;

    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }
    getUserTestimonials(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/testimonials`, {
      headers: this.getHeaders()
    });
  }

  approveTestimonial(testimonialId: string, adminNotes?: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/testimonials/${testimonialId}/approve`,
      { adminNotes },
      { headers: this.getHeaders() }
    );
  }

  rejectTestimonial(testimonialId: string, adminNotes?: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/testimonials/${testimonialId}/reject`,
      { adminNotes },
      { headers: this.getHeaders() }
    );
  }
  getUserOrdersForAdmin(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/orders`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/orders/${orderId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, {
      headers: this.getHeaders()
    });
  }
}
