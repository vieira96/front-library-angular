import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStateService } from '../auth-state.service';
import { isAdmin } from '../helper/is-admin';

export const adminGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  return authState.restoreSession().pipe(
    map(() => {
      if (isAdmin(authState.user())) {
        return true;
      }

      return router.createUrlTree(['/']);
    }),
  );
};
