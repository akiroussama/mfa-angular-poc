
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';
import { CnafButtonComponent } from '../shared-ui/cnaf-button/cnaf-button.component';
import { EventBusService } from '../services/event-bus.service';

@Component({
  selector: 'app-paiements-canary',
  standalone: true,
  imports: [MfeBaseComponent, CnafButtonComponent],
  template: `
    <app-mfe-base
      title="Gestion des Paiements"
      version="1.3.0-canary"
      channel="canary"
      contractVersion="2.2.0"
      icon="paid">
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          <strong>Nouveauté:</strong> Graphiques de prévision et paiements en temps réel. Cette version est en test.
        </p>
        <div class="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
          Ceci est une version Canary. Des instabilités peuvent survenir.
        </div>
        <div class="flex space-x-2">
            <app-cnaf-button (click)="viewForecast()" variant="primary">
              Voir Prévisions
            </app-cnaf-button>
             <app-cnaf-button (click)="viewRealtime()" variant="secondary">
              API de test
            </app-cnaf-button>
        </div>
      </div>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementsCanaryComponent {
  private eventBus = inject(EventBusService);

  // FIX: Changed to static to allow inspection without instantiation.
  public static contract: MfeContract = {
    version: '2.2.0',
    eventsSupported: ['paiement.effectue@1', 'paiement.prevision@1'],
    dependencies: {
        '@angular/core': '17.3.1', // slightly different version for demo
        'rxjs': '7.8.0',
        'd3': '7.9.0'
    }
  };

  viewForecast() {
    this.eventBus.publish({
      source: 'PaiementsCanary',
      type: 'paiement.prevision@1',
      payload: { nextPaymentDate: new Date().toISOString() }
    });
  }

  viewRealtime() {
    // This would call a test API endpoint
  }
}
