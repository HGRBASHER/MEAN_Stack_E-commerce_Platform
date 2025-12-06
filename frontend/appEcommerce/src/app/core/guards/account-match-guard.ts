import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const accountMatchGuard: CanMatchFn = (route, segments) => {
    const _auth = inject(AuthService);
  const _router = inject(Router);
  if (_auth.isAuthenticateUser()) {
    return true;
  }else {
    _router.navigate(['/home']);
    return false;
  }
};
