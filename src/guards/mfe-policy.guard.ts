import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import * as semver from 'semver';
import { ChaosService } from '../services/chaos.service';
import { LoggerService } from '../services/logger.service';
import { MfeLoaderService } from '../services/mfe-loader.service';
import { TracerService } from '../services/tracer.service';

const SHELL_CONTRACT_VERSION_RANGE = '^2.1.0'; // The contract version range supported by this shell

/**
 * ARCHITECTURAL NOTE: MFE Policy Guard
 * This is the brain of the C3 governance kernel. It runs after the AuthGuard and
 * is responsible for ensuring that an MFE is compliant with all governance policies
 * BEFORE it is allowed to be loaded.
 *
 * - Separation of Concerns: Cleanly separates MFE governance from user authentication.
 * - Pre-emptive Checks: Prevents a non-compliant, insecure, or broken MFE from ever reaching the user's browser.
 * - Intelligent Fallback: Demonstrates a key resilience pattern. If a canary fails validation, it doesn't just block the user; it seamlessly redirects them to the stable version.
 * - Fully Instrumented: Every decision is traced, making the governance process transparent and visible in the HUD.
 */
export const mfePolicyGuard: CanActivateFn = (route, state) => {
    const chaos = inject(ChaosService);
    const logger = inject(LoggerService);
    const mfeLoader = inject(MfeLoaderService);
    const tracer = inject(TracerService);
    const router = inject(Router);
    
    const { remoteName, channel } = getRemoteAndChannel(route);
    const mfeId = `${remoteName}@${channel}`;
    
    tracer.trace({
        source: 'Router',
        target: 'PolicyGuard',
        type: 'Check',
        status: 'SUCCESS',
        payload: { guard: 'PolicyGuard', status: 'start', mfe: mfeId }
    });
    
    const manifest = mfeLoader.getManifest();
    const entry = manifest[remoteName]?.[channel];
    
    // 1. Check if MFE exists in manifest
    if (!entry) {
        return traceAndBlock('ManifestEntryMissing', `MFE ${mfeId} not found in manifest.`);
    }

    // 2. (Chaos) Simulate remote down
    if (chaos.state().forceRemoteDown) {
        return traceAndHandleFallback('RemoteDown', `(Chaos) MFE ${mfeId} is down.`);
    }

    // 3. (Chaos) Simulate contract mismatch
    let contractVersion = entry.contractVersion;
    if (chaos.state().forceContractMismatch) {
        contractVersion = '3.0.0'; // Force an incompatible version
    }

    // 4. Check contract version compatibility
    if (!semver.satisfies(contractVersion, SHELL_CONTRACT_VERSION_RANGE)) {
       return traceAndHandleFallback('ContractMismatch', `Contract version mismatch for ${mfeId}. Shell requires '${SHELL_CONTRACT_VERSION_RANGE}', MFE has 'v${contractVersion}'.`);
    }

    // 5. Simulate async checks (perf, a11y) with chaos latency
    return of(true).pipe(
        delay(chaos.state().networkLatency),
        map(() => {
            // (Chaos) Simulate other failures after latency
            if (chaos.state().forcePerfBudgetFail) {
                return traceAndHandleFallback('PerfBudgetFail', `(Chaos) MFE ${mfeId} failed performance budget.`);
            }
            if (chaos.state().forceA11yFail) {
                return traceAndHandleFallback('A11yFail', `(Chaos) MFE ${mfeId} failed accessibility check.`);
            }

            // All checks passed
            tracer.trace({
                source: 'PolicyGuard',
                target: 'Router',
                type: 'Result',
                status: 'SUCCESS',
                payload: { guard: 'PolicyGuard', result: 'pass', mfe: mfeId }
            });
            logger.success('PolicyGuard', `All policies passed for ${mfeId}. Allowing activation.`);
            return true;
        })
    );

    // --- Helper Functions ---

    function traceAndBlock(reason: string, message: string): boolean {
        tracer.trace({
            source: 'PolicyGuard',
            target: 'Router',
            type: 'Result',
            status: 'ERROR',
            payload: { guard: 'PolicyGuard', result: 'fail', mfe: mfeId, reason }
        });
        logger.error('PolicyGuard', message);
        return false;
    }

    function traceAndHandleFallback(reason: string, message: string): boolean | UrlTree {
        logger.warn('PolicyGuard', message);
        
        // Only attempt fallback if the failing MFE is a canary and a stable version exists
        if (channel === 'canary' && manifest[remoteName]?.stable) {
            tracer.trace({
                source: 'PolicyGuard',
                target: 'Router',
                type: 'Action',
                status: 'WARN',
                payload: { guard: 'PolicyGuard', action: 'redirect', from: mfeId, to: `${remoteName}@stable`, reason }
            });
            logger.warn('PolicyGuard', `Initiating fallback to stable version for ${remoteName}.`);
            return router.createUrlTree(['/', remoteName, 'stable']);
        }
        
        // If it's not a canary or no stable fallback exists, block the navigation
        return traceAndBlock(reason, message);
    }
};

function getRemoteAndChannel(route: ActivatedRouteSnapshot): { remoteName: string, channel: 'stable' | 'canary' } {
    // e.g., /paiements/stable -> route.parent.url[0].path is 'paiements'
    const remoteName = route.parent?.url[0]?.path || '';
    // e.g., /paiements/stable -> route.url[0].path is 'stable'
    const channel = (route.url[0]?.path || 'stable') as 'stable' | 'canary';
    return { remoteName, channel };
}