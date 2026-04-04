import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token && !this.authService.isTokenExpired(token)) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if ((error.status === 401 || error.status === 403) && !req.url.includes('/api/auth/login')) {
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if ((error.status === 401 || error.status === 403) && !req.url.includes('/api/auth/login')) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
