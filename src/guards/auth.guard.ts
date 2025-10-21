import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

/**
 * ARCHITECTURAL NOTE: Authentication Guard
 *
 * This functional route guard is a transverse security component. It ensures
 * that no MFE can be accessed without a valid user session.
 *
 * - Centralized Logic: Security rules are defined in one place, not scattered across MFEs.
 * - Decoupling: MFEs don't need to know about authentication; they can assume if they are loaded, the user is authenticated.
 * - Non-Invasive: It protects routes without modifying the MFE components themselves.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // FIX: Explicitly typed the injected Router to resolve potential type inference issues.
  const router: Router = inject(Router);
  const logger = inject(LoggerService);

  if (authService.currentUser()) {
    return true;
  }

  // Redirect to the home page (which will show the login prompt)
  logger.warn('AuthGuard', `Blocked unauthenticated access to ${state.url}`);
  router.navigate(['/']);
  return false;
};
