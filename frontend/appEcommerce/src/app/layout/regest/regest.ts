import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-regest',
  imports: [ReactiveFormsModule,RouterLink,RouterLinkActive],
  templateUrl: './regest.html',
  styleUrl: './regest.css',
})
export class Regest {
  regestForm =new FormGroup({
    name: new FormControl('',Validators.required),
    email: new FormControl('',Validators.required),
    password: new FormControl('',[Validators.required, Validators.minLength(6)])
  });
  loading: boolean = false;
  sccessMessage: boolean = false;
  alreadyHaveAccount: boolean = false;
  constructor(private http: HttpClient,private router:Router) {}
canDeactivate(){
  if(this.regestForm.invalid && this.regestForm.dirty){
    return confirm('Are you sure want to leave this page?');
  }
  return true;
}
  onSubmit(){
    if (this.regestForm.invalid) {
      this.markAllAsTouched();
      return;
    }
    const formData = {
      name: this.regestForm.value.name,
      email: this.regestForm.value.email,
      password: this.regestForm.value.password,
      role: 'user'};
      this.loading = true;
      this.http.post(`${environment.apiURL}/auth/register`, formData)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.token) {
              localStorage.setItem('token', response.token);
                this.sccessMessage = true;
                setTimeout(() => {
                  this.router.navigate(['/login']);
                }, 3000);
            }
          },
          error: (error) => {
            this.loading = false;
            console.error('Error registering user:', error);
            if (error.status === 400) {
              this.alreadyHaveAccount = true;
              setTimeout(() => {
                  this.alreadyHaveAccount = false;
                }, 3000);
            }
  }
}
      );
  }
  private markAllAsTouched() {
    Object.keys(this.regestForm.controls).forEach(key => {
      const control = this.regestForm.get(key);
      control?.markAsTouched();
    });
  }
  get name() { return this.regestForm.get('name'); }
  get email() { return this.regestForm.get('email'); }
  get password() { return this.regestForm.get('password'); }
}
