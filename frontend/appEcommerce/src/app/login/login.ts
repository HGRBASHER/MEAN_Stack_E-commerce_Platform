import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink,RouterLinkActive],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
loginForm:FormGroup = new FormGroup({
  email: new FormControl(''),
  password: new FormControl('')
})
constructor(private _authService:AuthService,private _router:Router){}
login(){
  // console.log(this.loginForm.value);
  this._authService.login(this.loginForm.value).subscribe({
    next: (data)=>{

    },
    error: (err)=>{
      // console.log(err);
      return this._router.navigate(['/regest']);
    }
  });
}
}
