
import { Injectable, inject, Type } from '@angular/core';
import { LoggerService } from './logger.service';
import { ChaosService } from './chaos.service';
import { Mfe, MfeManifest, MfeManifestEntry } from '../contracts/mfe.contracts';
import { AllocataireStableComponent } from '../remotes/allocataire-stable.component';
import { PaiementsStableComponent } from '../remotes/paiements-stable.component';
import { PaiementsCanaryComponent } from '../remotes/paiements-canary.component';
import { FallbackComponent } from '../remotes/fallback.component';

// This is a stand-in for a real module federation loader.
// In a real Native Federation setup, these components would be loaded from remote entries.
// This registry simulates that lookup.
const componentRegistry: { [key: string]: Type<any> } = {
  'allocataire@stable': AllocataireStableComponent,
  'paiements@stable': PaiementsStableComponent,
  'paiements@canary': PaiementsCanaryComponent
};

@Injectable({ providedIn: 'root' })
export class MfeLoaderService {
  private logger = inject(LoggerService);
  private chaos = inject(ChaosService);

  // This would be fetched from a remote server in a real application
  private mfeManifest: MfeManifest = {
    'allocataire': {
      stable: { version: '1.2.0', contractVersion: '2.1.0', bundleUrl: '/remotes/allocataire-stable.js', bundleSha256: 'abc', policies: { perfBudget: { lcp: 2500, bundleSize: 250 }, a11y: { minScore: 0, mode: 'strict' }, security: { httpAllowList: ['api.cnaf.fr'] } } }
    },
    'paiements': {
      stable: { version: '1.2.0', contractVersion: '2.1.0', bundleUrl: '/remotes/paiements-stable.js', bundleSha256: 'def', policies: { perfBudget: { lcp: 2500, bundleSize: 250 }, a11y: { minScore: 0, mode: 'strict' }, security: { httpAllowList: ['api.cnaf.fr'] } } },
      canary: { version: '1.3.0', contractVersion: '2.2.0', bundleUrl: '/remotes/paiements-canary.js', bundleSha256: 'ghi', policies: { perfBudget: { lcp: 2000, bundleSize: 220 }, a11y: { minScore: 0, mode: 'soft' }, security: { httpAllowList: ['api.cnaf.fr', 'test.api.cnaf.fr'] } } }
    }
  };

  getManifest(): MfeManifest {
    return this.mfeManifest;
  }
  
  getAvailableRemotes(): string[] {
    return Object.keys(this.mfeManifest);
  }
  
  getComponentRegistry() {
    return componentRegistry;
  }

  // NOTE: The MFE loading logic itself is no longer in this service.
  // The Angular Router's `loadComponent` feature now handles the dynamic import.
  // In a real Native Federation setup, you might have guards or resolvers
  // that call this service to perform policy checks before a route is allowed to activate.
  // The logic from the old `loadMfe` method would live inside those guards/resolvers.
  // For this demonstrator, we keep the logic inside the components themselves for simplicity.
}
