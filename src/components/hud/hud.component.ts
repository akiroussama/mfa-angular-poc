import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../services/logger.service';
import { ChaosService, ChaosState } from '../../services/chaos.service';
import { MfeLoaderService } from '../../services/mfe-loader.service';
import { ThemeService } from '../../services/theme.service';
import { TracerComponent } from './tracer/tracer.component'; // Import the new TracerComponent

type HudTab = 'journal' | 'chaos' | 'policies' | 'dependencies' | 'tracer';

@Component({
  selector: 'app-hud',
  templateUrl: './hud.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TracerComponent], // Add TracerComponent to imports
})
export class HudComponent {
  logger = inject(LoggerService);
  chaosService = inject(ChaosService);
  mfeLoader = inject(MfeLoaderService);
  themeService = inject(ThemeService);

  activeTab = signal<HudTab>('tracer'); // Default to the new Tracer tab
  isExpanded = signal(true); 

  chaosState = this.chaosService.state;
  logs = this.logger.logs;
  manifest = this.mfeLoader.getManifest();
  
  governanceMode = signal<'strict' | 'soft'>('strict');
  
  tabs: {id: HudTab, label: string}[] = [
      {id: 'tracer', label: 'Tracer'},
      {id: 'journal', label: 'Journal'},
      {id: 'chaos', label: 'Chaos'},
      {id: 'policies', label: 'Policies'},
      {id: 'dependencies', label: 'Dependencies'}
  ];

  chaosToggles: { key: keyof Omit<ChaosState, 'networkLatency'>, label: string }[] = [
    { key: 'forceContractMismatch', label: 'Force Contract Mismatch' },
    { key: 'forcePerfBudgetFail', label: 'Force Perf Budget Fail' },
    { key: 'forceA11yFail', label: 'Force A11y Fail' },
    { key: 'forceRemoteDown', label: 'Force Remote Down' }
  ];

  allDependencies = computed(() => {
    const deps = new Map<string, { providedBy: string[], versions: Set<string>}>();
    const componentRegistry = this.mfeLoader.getComponentRegistry();

    Object.entries(this.manifest).forEach(([remoteName, remote]) => {
      const stableComponentType = componentRegistry[`${remoteName}@stable`];
      if (stableComponentType && (stableComponentType as any).contract) {
        const stableContract = (stableComponentType as any).contract;
        Object.entries(stableContract.dependencies).forEach(([pkg, version]) => {
            if (!deps.has(pkg)) deps.set(pkg, { providedBy: [], versions: new Set()});
            deps.get(pkg)?.providedBy.push(`${remoteName}@stable`);
            deps.get(pkg)?.versions.add(version as string);
        });
      }
      
      if (remote.canary) {
        const canaryComponentType = componentRegistry[`${remoteName}@canary`];
        if (canaryComponentType && (canaryComponentType as any).contract) {
            const canaryContract = (canaryComponentType as any).contract;
            Object.entries(canaryContract.dependencies).forEach(([pkg, version]) => {
              if (!deps.has(pkg)) deps.set(pkg, { providedBy: [], versions: new Set()});
              deps.get(pkg)?.providedBy.push(`${remoteName}@canary`);
              deps.get(pkg)?.versions.add(version as string);
            });
        }
      }
    });
    return Array.from(deps.entries());
  });


  selectTab(tab: HudTab) {
    this.activeTab.set(tab);
    if(!this.isExpanded()) {
        this.isExpanded.set(true);
    }
  }

  toggleExpansion() {
    this.isExpanded.update(v => !v);
  }

  toggleGovernanceMode() {
    this.governanceMode.update(m => m === 'strict' ? 'soft' : 'strict');
    this.logger.log('KernelC3', `(Simulated) Governance mode switched to ${this.governanceMode()}`);
  }

  updateNetworkLatency(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const latency = +selectElement.value;
    this.chaosService.state.update(s => ({ ...s, networkLatency: latency }));
  }

  updateChaosToggle(key: keyof Omit<ChaosState, 'networkLatency'>, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;
    this.chaosService.state.update(s => ({ ...s, [key]: isChecked }));
  }
}
