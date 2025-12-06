import { Component, OnInit } from '@angular/core';
import { Footer } from "./shared/footer/footer";
import { Router, RouterOutlet } from "@angular/router";
import { Header } from "./shared/header/header";
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
name = '';
constructor(private _authService:AuthService,private _router:Router){}
  ngOnInit(): void {
    this._authService.getUserData().subscribe(data=>{
      if(data){
        this.name = data.name;
      }
      else{
        // this._router.navigate(['/home']);
        this.name = ''
      }
    });
  }

logout(){
this._router.navigate(['/home']);
  this._authService.logout();
}
}
