import { Injectable, signal, inject } from '@angular/core';
import { LoggerService } from './logger.service';

export interface User {
  name: string;
  roles: string[];
}

/**
 * ARCHITECTURAL NOTE: Authentication Service
 *
 * This service simulates an authentication context for the entire application.
 * In a real-world scenario, this would handle JWTs, session management, and communication
 * with an identity provider (IdP).
 *
 * - Singleton State: `providedIn: 'root'` ensures a single instance holds the auth state for the Shell and all MFEs.
 * - Signal-based: Using a signal for `currentUser` provides a reactive, modern way to manage and propagate authentication state changes throughout the app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // FIX: Replaced `new LoggerService()` with `inject(LoggerService)`.
  // Manually instantiating a service with `new` is an anti-pattern that breaks
  // Angular's Dependency Injection. The original code failed because the
  // LoggerService's constructor tried to `inject(EventBusService)` outside of an
  // injection context, causing a fatal error on startup.
  // The previous comment about a DI cycle was incorrect.
  private logger = inject(LoggerService);
  currentUser = signal<User | null>(null);

  login(user: User) {
    this.currentUser.set(user);
    this.logger.success('AuthService', `User '${user.name}' logged in.`);
  }

  logout() {
    const username = this.currentUser()?.name;
    this.currentUser.set(null);
    if(username) {
        this.logger.log('AuthService', `User '${username}' logged out.`);
    }
  }
}