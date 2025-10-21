import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { TracerService } from '../services/tracer.service';

/**
 * ARCHITECTURAL NOTE: Authentication Guard
 * This functional route guard is a transverse security component.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);
  const logger = inject(LoggerService);
  const tracer = inject(TracerService);

  tracer.trace({
      source: 'Router',
      target: 'AuthGuard',
      type: 'Check',
      status: 'SUCCESS',
      payload: { guard: 'AuthGuard', status: 'start' }
  });

  if (authService.currentUser()) {
    tracer.trace({
      source: 'AuthGuard',
      target: 'Router',
      type: 'Result',
      status: 'SUCCESS',
      payload: { guard: 'AuthGuard', result: 'pass' }
    });
    return true;
  }

  // Redirect to the home page (which will show the login prompt)
  logger.warn('AuthGuard', `Blocked unauthenticated access to ${state.url}`);
  tracer.trace({
      source: 'AuthGuard',
      target: 'Router',
      type: 'Result',
      status: 'ERROR',
      payload: { guard: 'AuthGuard', result: 'fail', reason: 'Not authenticated' }
  });
  
  // FIX: Return a UrlTree instead of navigating imperatively to avoid circular dependencies.
  return router.createUrlTree(['/']);
};
