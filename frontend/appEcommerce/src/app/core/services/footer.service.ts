import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Ifooter } from '../models/footer.model';
import { environment } from '../../../enviroments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private apiUrl = environment.apiURL + '/footer';

  private footerSubject = new BehaviorSubject<Ifooter | null>(null);
  footer$ = this.footerSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService ,private _router:Router
  ) {}
private getAuthHeaders() {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getFooter(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  loadFooter() {
    this.getFooter().subscribe({
      next: (res) => {
        this.footerSubject.next(res.data);
      },
      error: (err) => {
        console.error('Error loading footer:', err);
        const defaultFooter: Ifooter = {
          name: '',
          desc: '',
          phone: '',
          address: '',
          facebook: '',
          github: '',
          linkedin: '',
          instagram: ''
        };
        this.footerSubject.next(defaultFooter);
      }
    });
  }

  updateFooter(data: Ifooter): Observable<any> {
    return this.http.patch(`${this.apiUrl}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: (res: any) => {
          this.footerSubject.next(res.data);
        },
        error: (err) => {
          console.error('Error updating footer:', err);
          if (err.status === 401) {
            this.authService.logout();
            this._router.navigate(['/login']);
          }
        }
      })
    );
  }

  canUpdateFooter(): boolean {
    return this.authService.isAuthenticateAdmin();
  }
}
