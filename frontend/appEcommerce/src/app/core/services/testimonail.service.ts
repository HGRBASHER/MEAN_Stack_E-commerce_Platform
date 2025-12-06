import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import {ITestimonialResponse,ITestimonialsResponse,ICreateTestimonialRequest} from '../models/testimonial.model';


@Injectable({
  providedIn: 'root',
})
export class TestimonailService {
  private apiUrl = environment.apiURL + '/testimonials';
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
addTestimonial(testimonialData: ICreateTestimonialRequest): Observable<ITestimonialResponse> {
    return this.http.post<ITestimonialResponse>(
      this.apiUrl,
      testimonialData,
      { headers: this.getHeaders() }
    );
  }
getMyTestimonials(): Observable<ITestimonialsResponse> {
    return this.http.get<ITestimonialsResponse>(
      `${this.apiUrl}/my-testimonials`,
      { headers: this.getHeaders() }
    );
  }
updateTestimonial(id: string, testimonialData: any): Observable<ITestimonialResponse> {
    return this.http.put<ITestimonialResponse>(
      `${this.apiUrl}/${id}`,
      testimonialData,
      { headers: this.getHeaders() }
    );
  }
deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
getApprovedTestimonials(): Observable<ITestimonialsResponse> {
    return this.http.get<ITestimonialsResponse>(
      `${this.apiUrl}/approved`
    );
  }
getLatestTestimonials(limit: number = 6): Observable<ITestimonialsResponse> {
    return this.http.get<ITestimonialsResponse>(
      `${this.apiUrl}/approved/latest?limit=${limit}`
    );
  }
}

