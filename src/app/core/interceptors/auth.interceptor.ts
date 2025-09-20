import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Add authorization header if token exists
  const authReq = token ? req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 403 Forbidden errors - redirect to login
      if (error.status === 403) {
        console.warn('403 Forbidden - Redirecting to login page');
        
        // Clear auth data since token is invalid/expired
        authService.logout().subscribe({
          next: () => {
            router.navigate(['/login']);
          },
          error: () => {
            // Even if logout API fails, clear local data and redirect
            authService.clearAuthData();
            router.navigate(['/login']);
          }
        });
      }
      
      return throwError(() => error);
    })
  );
};
