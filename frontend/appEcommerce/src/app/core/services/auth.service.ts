import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ILoginData, ILoginResponse, ITokenDecode } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userData = new BehaviorSubject<ITokenDecode | null>(null);


  apiURL = environment.apiURL + '/auth/login';
constructor(private _http:HttpClient,private _router:Router) {}
  login(data:ILoginData){
    return this._http.post<ILoginResponse>(this.apiURL,data).pipe(
      tap((rse)=>{
        // console.log('res ',rse);
        //1-get token from response
        const token = rse.data;
        //2- save token in localstorage
        this.setToken(token);
        //3- decode token
        const decode = this.tokenDecode(token);
        if(decode){
          if(decode.role==='admin'){
            //route using code
            this._router.navigate(['/dashboard']);
          }else{
            this._router.navigate(['/home']);
          }
          //4- store user data to observable
          this.userData.next(decode);
        }
      })
    );
  }

  isValidToken(token:string){
    if(token){
      const decode = this.tokenDecode(token);
      if(decode){
        const exp = decode.exp * 1000;
        if(Date.now() < exp){
        return true;
        }
      }
    }
    return false;
  }
  checkToken(){
    const token = this.getToken();
    if(token){
    if(this.isValidToken(token)){
      const decode = this.tokenDecode(token);
        this.userData.next(decode);
    }else{
      this.logout();
    }
    }
  }


  isAuthenticateUser(){
    const token = this.getToken();
    if(token){
      if(this.isValidToken(token)){
        const decode = this.tokenDecode(token);
        if(decode?.role==='user'){
          return true;
        }
      }
    }
    return false;
  }

  isAuthenticateAdmin(){
    const token = this.getToken();
    if(token){
      if(this.isValidToken(token)){
        const decode = this.tokenDecode(token);
        if(decode?.role==='admin'){
          return true;
        }
      }
    }
    return false;
  }

logout(){
  localStorage.removeItem(this.TOKEN_KEY);
  this.userData.next(null);
  this._router.navigate(['/login']);
}
  getUserData(){
    return this.userData.asObservable();
  }

protected TOKEN_KEY:string = 'token';
  private setToken(token:string){
    localStorage.setItem(this.TOKEN_KEY,token);
  }
  public getToken(): string | null{
    return localStorage.getItem(this.TOKEN_KEY);
  }
  private tokenDecode(token:string): ITokenDecode | null {
    try{
    const decode=jwtDecode<ITokenDecode>(token);

      return decode;
    }
    catch(err){
      return null;
    }
  }

}

