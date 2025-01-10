import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('entro al guard');
  
  return authService.validateLogin() ? true: router.navigateByUrl('/auth/login');
};
