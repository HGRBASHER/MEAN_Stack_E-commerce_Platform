import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = environment.apiURL + '/report';

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
  getSalesReport(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/`;
    const params: string[] = [];

      if (startDate) {
        params.push(`startDate=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
        params.push(`endDate=${encodeURIComponent(endDate)}`);
    }

    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }

    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }
  exportReport(format: 'pdf' | 'excel', startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/export/${format}`;

    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
