import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
// import { UserModel } from '../models/internal/user.model';
import { UserModel } from '../models/internal/user.model';
import { Router } from '@angular/router';


const base_url = "https://almacenback.onrender.com/api";
// const base_url = "http://localhost:8000/api";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userData!: UserModel;

  constructor(private http: HttpClient,
              private router: Router) { }

  get DataUser() {
    return this.userData;
  }

  set DataUser(value: any) {
    this.userData = value;
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  // get headers() {
  //   return {
  //     headers: {
  //       'username': 'llerena@gmail.com',
  //       'password': 'admin123'
  //     }
  //   }
  // }

  saveLocalStorage(  data: any ) {

    
    // localStorage.setItem('user', data.user_data.email );
    localStorage.setItem('user', JSON.stringify(data.user) );
    localStorage.setItem('local', JSON.stringify(data.local) );
    localStorage.setItem('permissions', JSON.stringify(data.permissions) );
    localStorage.setItem('token', JSON.stringify(data.access_token));
    // localStorage.setItem('refresh', JSON.stringify(data.token_data.refresh_token) );
    

  }

  saveRefreshLocalStorage(  data: any ) {

    console.log("se guardo refreshdata");
    
    // localStorage.setItem('user', data.user_data.email );
    localStorage.setItem('token', JSON.stringify(data.acces_token) );
    localStorage.setItem('refresh', JSON.stringify(data.refresh_token) );
    // window.location.reload();

  }



  login(data: any) {

    const body = new HttpParams()
      .set('grant_type', '')
      .set('username', data.email)
      .set('password', data.password)
    

    const url = `${ base_url }/auth`;
    // console.log(question);
    
    return this.http.post<any>( url, body);
    // return this.http.post<any>( url, data ).pipe(map(res => UserModel.createFromObject(res.data)));
  }

  refreshToken() {
    console.log("ingres al refreshtokenporinterceptor");
    
    const headers = new HttpHeaders().set('refresh-token', JSON.parse(localStorage.getItem('refresh')!));
    const url = `${ base_url }/refresh`;
    return this.http.post<any>(url, "", {headers});
  }

  // createHeadersRefresh() {
    
  //   return {
  //     headers: new HttpHeaders({
  //       'refresh-token': JSON.parse(localStorage.getItem('refresh')!)
  //     })
  //   }
  // }

  validateLogin(): boolean {

    if(this.token) {

      console.log("encontro el token")
      return true;
    } else {
      return false;
    }
    
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('local');
    localStorage.removeItem('permissions');
    this.router.navigateByUrl('auth/login');

  }

  // retrieveUsers() {
  //   const url = `${ base_url }/me`;
  //   // console.log(question);
    
  //   return this.http.get<any>( url, this.createHeaders()).pipe(map(res => console.log(res)));
  // }

  // createHeaders() {
    
  //   return {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token')!)}`
  //       // 'Authorization': `Bearer ${this.token}`
  //     })
  //   }
  // }
}
