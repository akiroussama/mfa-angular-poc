import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MfeLoaderService } from './services/mfe-loader.service';
import { inject } from '@angular/core';

/**
 * ARCHITECTURAL NOTE: Dynamic MFE Routing
 *
 * This routing configuration is the heart of the new, more advanced architecture.
 * - Lazy Loading: Each MFE component is loaded on demand using `loadComponent`, which is essential for performance in a large-scale application.
 * - Channel-Aware Routes: We define explicit routes for `stable` and `canary` channels. This provides clear, bookmarkable URLs and simplifies the loading logic.
 * - Centralized Guarding: The `authGuard` is applied centrally here, ensuring that security policies are enforced consistently across all business domains (MFEs).
 * - Fallback and Default Routes: A default redirect to a stable channel ensures a consistent user experience.
 */
export const routes: Routes = [
  {
    path: 'allocataire',
    canActivate: [authGuard],
    children: [
      {
        path: 'stable',
        loadComponent: () => import('./remotes/allocataire-stable.component').then(m => m.AllocataireStableComponent)
      },
      // Allocataire has no canary, so we can redirect or show a "not available" component.
      // For simplicity, we redirect to stable.
      { path: 'canary', redirectTo: 'stable', pathMatch: 'full' },
      { path: '', redirectTo: 'stable', pathMatch: 'full' }
    ]
  },
  {
    path: 'paiements',
    canActivate: [authGuard],
    resolve: {
      // Example of a resolver to check if canary is available from the manifest
      canaryAvailable: () => {
        const manifest = inject(MfeLoaderService).getManifest();
        return !!manifest['paiements']?.canary;
      }
    },
    children: [
      {
        path: 'stable',
        loadComponent: () => import('./remotes/paiements-stable.component').then(m => m.PaiementsStableComponent)
      },
      {
        path: 'canary',
        loadComponent: () => import('./remotes/paiements-canary.component').then(m => m.PaiementsCanaryComponent)
      },
      { path: '', redirectTo: 'stable', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'allocataire' // Default route for the application
  },
  {
    path: '**',
    redirectTo: 'allocataire' // Wildcard route to handle invalid URLs
  }
];
