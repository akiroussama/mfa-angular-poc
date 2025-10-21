import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MfeComponent } from '../contracts/mfe.contracts';
import { ChaosService } from '../services/chaos.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-mfe-base',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-700 border" [class]="borderColor()">
      <div class="p-4 border-b flex justify-between items-center" [class]="borderColor()">
        <div>
            <h3 class="text-lg font-bold flex items-center space-x-2">
              <span class="material-symbols-outlined">{{ icon() }}</span>
              <span>{{ title() }}</span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Version: {{ version() }} | Contrat: {{ contractVersion() }}
            </p>
        </div>
        <div class="px-3 py-1 text-sm font-semibold rounded-full" [class]="channelClass()">
            {{ channel() | titlecase }}
        </div>
      </div>
      <div class="p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class MfeBaseComponent extends MfeComponent {
  // FIX: Replaced @Input decorators with modern signal inputs.
  title = input<string>('');
  version = input<string>('');
  // FIX: Used input.required() for the required 'channel' input.
  channel = input.required<'stable' | 'canary'>();
  contractVersion = input<string>('');
  icon = input<string>('');

  // FIX: Updated computed properties to read from input signals by calling them as functions.
  borderColor = computed(() => this.channel() === 'canary' ? 'border-yellow-400' : 'border-gray-200 dark:border-gray-600');
  channelClass = computed(() => this.channel() === 'canary' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-500 text-white');

  chaosService = inject(ChaosService);
  logger = inject(LoggerService);

  callApi(endpoint: string) {
      if (this.chaosService.state().forceHttpBlock) {
          this.logger.error(`${this.title()}`, `BLOCKED (Chaos) API call to ${endpoint}`);
          return;
      }
      this.logger.success(`${this.title()}`, `Allowed API call to ${endpoint}`);
  }
}
