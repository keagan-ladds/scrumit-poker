import type { ResolveFn } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const roomResolver: ResolveFn<boolean> = (route, state) => {
  const authService: AuthService = inject(AuthService);

  return authService.signIn().pipe(map(user => {
    return true;
  }))
};
