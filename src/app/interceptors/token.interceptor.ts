import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, Subject, catchError, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private refreshTokenSubject: Subject<any> = new Subject<any>();

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const token: string = JSON.parse(localStorage.getItem('token')!);
    let request = req;
    if(token) {

      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${ token }`
          // Authorization: `Bearer ${ token }`
        }
      });

      // 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token')!)}`

      console.log("paso por el interceptor");
    }

    
    return next.handle(request).pipe(
      // catchError(this.manageError)
      catchError((error: HttpErrorResponse) => {
        if(error.status === 403) {
          return this.handle403Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }


  private handle403Error(request: HttpRequest<any>, next: HttpHandler) {

    const token: string = JSON.parse(localStorage.getItem('token')!);
    // if(token) {
    //   return this.authService.refreshToken().pipe( 
    //     switchMap((res) => {
    //       console.log(res);
    //       this.authService.saveRefreshLocalStorage(res)
    //       return next.handle(request);
    //     }
    //   ), catchError((error) => {
    //     return throwError(() => error);
    //   }));
    // }
    
    if(token) {
      this.authService.refreshToken().subscribe(
        (res: any) => {
          this.authService.saveRefreshLocalStorage(res);
          this.refreshTokenSubject.next(res.refresh_token);
        },
        (refreshError) => {
          console.error('Error al renovar el token', refreshError);
          // Puedes manejar el error de renovación de token aquí y redirigir a la página de inicio de sesión si es necesario
        },

      )
    }

    return this.refreshTokenSubject.pipe(
      take(1),
      switchMap(() => next.handle(this.addToken(request)))
    );
    // return next.handle(request);
  }

  private addToken(request: HttpRequest<any>): HttpRequest<any> {
    const token: string = JSON.parse(localStorage.getItem('token')!);

    if(token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${ token }`
          // Authorization: `Bearer ${ token }`
        }
      });
    }

    return request;
  }

  manageError(error: HttpErrorResponse) {
    console.log('Sucedio un error');
    console.log('Sucedio un error');
    console.warn(error);
    return throwError(() => error)
    
  }
}
