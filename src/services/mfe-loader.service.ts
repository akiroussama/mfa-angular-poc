
import { Injectable, inject, Type } from '@angular/core';
import { LoggerService } from './logger.service';
import { ChaosService } from './chaos.service';
import { Mfe, MfeManifest, MfeManifestEntry } from '../contracts/mfe.contracts';
import { AllocataireStableComponent } from '../remotes/allocataire-stable.component';
import { PaiementsStableComponent } from '../remotes/paiements-stable.component';
import { PaiementsCanaryComponent } from '../remotes/paiements-canary.component';
import { FallbackComponent } from '../remotes/fallback.component';

import { satisfies } from 'semver'; // We will mock this.
import { ComponentRef } from '@angular/core';

// Mocking semver for browser environment
const semverMock = {
  satisfies: (version: string, range: string) => {
    if (range.startsWith('^')) {
      const base = range.substring(1);
      const [baseMajor] = base.split('.');
      const [verMajor] = version.split('.');
      return baseMajor === verMajor;
    }
    return version === range;
  }
};

export interface MfeState {
  channel: 'stable' | 'canary';
  loadedComponent: ComponentRef<any> | null;
}

declare const axe: any;

@Injectable({ providedIn: 'root' })
export class MfeLoaderService {
  private logger = inject(LoggerService);
  private chaos = inject(ChaosService);

  private governanceMode: 'strict' | 'soft' = 'strict';
  private hostContractVersionRange = '^2.0.0';

  private circuitBreaker: { [key: string]: { state: 'CLOSED' | 'OPEN'; openUntil?: number } } = {};
  
  private componentRegistry: { [key: string]: Type<any> } = {
    'allocataire@stable': AllocataireStableComponent,
    'paiements@stable': PaiementsStableComponent,
    'paiements@canary': PaiementsCanaryComponent
  };

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

  setGovernanceMode(mode: 'strict' | 'soft') {
    this.governanceMode = mode;
    this.logger.log('KernelC3', `Governance mode switched to ${mode}`);
  }

  getGovernanceMode() {
    return this.governanceMode;
  }

  async loadMfe(remoteName: string, channel: 'stable' | 'canary'): Promise<Type<any>> {
    const breakerKey = `${remoteName}@${channel}`;
    if (this.circuitBreaker[breakerKey]?.state === 'OPEN' && Date.now() < this.circuitBreaker[breakerKey].openUntil!) {
      this.logger.warn('CircuitBreaker', `Loading blocked for ${breakerKey}. Circuit breaker is OPEN.`);
      if (channel === 'canary') {
        this.logger.log('Fallback', `Circuit breaker for canary is open. Attempting to load stable version for ${remoteName}.`);
        return this.loadMfe(remoteName, 'stable');
      }
      this.logger.error('Fallback', `Circuit breaker for stable is open. Loading global fallback component for ${breakerKey}.`);
      return Promise.resolve(FallbackComponent);
    }
    this.circuitBreaker[breakerKey] = { state: 'CLOSED' };

    const chaosState = this.chaos.state();
    this.logger.log('MfeLoader', `Attempting to load remote '${remoteName}' on channel '${channel}'...`);
    
    if (chaosState.networkLatency > 0) {
      this.logger.warn('Chaos', `Injecting ${chaosState.networkLatency}ms network latency.`);
      await new Promise(res => setTimeout(res, chaosState.networkLatency));
    }
    if (chaosState.forceRemoteDown) {
      this.logger.error('Chaos', 'Simulating remote is down.');
      return this.handleFailure(breakerKey, new Error('Remote is down (Chaos)'), remoteName);
    }

    const manifestEntry = this.mfeManifest[remoteName]?.[channel];
    if (!manifestEntry) {
      this.logger.error('MfeLoader', `No manifest entry for ${remoteName}@${channel}.`);
      return this.handleFailure(breakerKey, new Error('Manifest entry not found'), remoteName);
    }
    
    const componentType = this.componentRegistry[`${remoteName}@${channel}`];
    // FIX: Read contract from static property on the component type, do NOT instantiate with `new`.
    const contract = (componentType as any).contract;
    if (!contract) {
        return this.handleFailure(breakerKey, new Error(`MFE ${remoteName}@${channel} is missing its static 'contract' property.`), remoteName);
    }

    try {
      // 1. Contract Guard
      const contractVersion = chaosState.forceContractMismatch ? '3.0.0' : contract.version;
      if (!semverMock.satisfies(contractVersion, this.hostContractVersionRange)) {
        throw new Error(`Contract version mismatch. Host requires '${this.hostContractVersionRange}', but remote provides '${contractVersion}'.`);
      }
      this.logger.success('ContractGuard', `Contract for ${remoteName}@${channel} (v${contractVersion}) is compatible.`);

      // 2. Performance Guard
      const perfLCP = chaosState.forcePerfBudgetFail ? 3000 : 1800; // Simulated LCP
      if (perfLCP > manifestEntry.policies.perfBudget.lcp) {
          throw new Error(`Performance budget exceeded. LCP (${perfLCP}ms) > budget (${manifestEntry.policies.perfBudget.lcp}ms).`);
      }
      this.logger.success('PerfGuard', `Performance for ${remoteName}@${channel} is within budget.`);

      // 3. Accessibility Guard (simulated)
      const a11yViolations = chaosState.forceA11yFail ? 1 : 0; // Simulated critical violations
      if (a11yViolations > manifestEntry.policies.a11y.minScore) {
          throw new Error(`Accessibility violations found (${a11yViolations} critical).`);
      }
      this.logger.success('A11yGuard', `Accessibility for ${remoteName}@${channel} passed.`);
      
      // All checks passed
      this.logger.success('MfeLoader', `Successfully loaded and validated ${remoteName}@${channel}.`);
      return componentType;

    } catch (error: any) {
      if (this.governanceMode === 'strict') {
        this.logger.error('KernelC3', `STRICT MODE: Blocking ${remoteName}@${channel}. Reason: ${error.message}`);
        return this.handleFailure(breakerKey, error, remoteName);
      } else {
        this.logger.warn('KernelC3', `SOFT MODE: Allowing ${remoteName}@${channel} despite validation failure. Reason: ${error.message}`);
        return componentType;
      }
    }
  }

  private handleFailure(breakerKey: string, error: Error, remoteNameToFallback: string): Promise<Type<any>> {
    this.circuitBreaker[breakerKey] = { state: 'OPEN', openUntil: Date.now() + 5000 };
    this.logger.error('CircuitBreaker', `Opening circuit for ${breakerKey} for 5 seconds.`);

    if (remoteNameToFallback) {
      this.logger.log('Fallback', `Attempting to load stable version for ${remoteNameToFallback}.`);
      if (!breakerKey.endsWith('@stable')) {
        return this.loadMfe(remoteNameToFallback, 'stable');
      }
    }
    this.logger.error('Fallback', `No stable version available or stable failed. Loading global fallback component.`);
    return Promise.resolve(FallbackComponent);
  }
}
