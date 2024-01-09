import type { ResolveFn } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { SpinnerService } from '../shared/spinner/spinner.service';

export const roomResolver: ResolveFn<boolean> = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const spinnerService: SpinnerService = inject(SpinnerService);

  spinnerService.showSpinner();
  return authService.signIn().pipe(map(user => {
    spinnerService.hideSpinner();
    return true;
  }))
};
