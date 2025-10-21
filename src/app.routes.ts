import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MfeLoaderService } from './services/mfe-loader.service';
import { inject } from '@angular/core';
import { mfePolicyGuard } from './guards/mfe-policy.guard';

/**
 * ARCHITECTURAL NOTE: Dynamic MFE Routing with Multi-layered Guarding
 * This routing configuration now demonstrates a more sophisticated, production-like
 * security and governance model.
 * - Multi-layered Guards: The `canActivate` array now includes both `authGuard` and
 *   the new `mfePolicyGuard`. This ensures that a route is first checked for user
 *   authentication, and only then is the MFE's compliance checked. This is a
 *   clean separation of security and governance concerns.
 */
export const routes: Routes = [
  {
    path: 'allocataire',
    canActivate: [authGuard, mfePolicyGuard], // Added mfePolicyGuard
    children: [
      {
        path: 'stable',
        loadComponent: () => import('./remotes/allocataire-stable.component').then(m => m.AllocataireStableComponent)
      },
      { path: 'canary', redirectTo: 'stable', pathMatch: 'full' },
      { path: '', redirectTo: 'stable', pathMatch: 'full' }
    ]
  },
  {
    path: 'paiements',
    canActivate: [authGuard, mfePolicyGuard], // Added mfePolicyGuard
    resolve: {
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
    redirectTo: 'allocataire' 
  },
  {
    path: '**',
    redirectTo: 'allocataire' 
  }
];
