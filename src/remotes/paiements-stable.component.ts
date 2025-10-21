
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';
import { CnafButtonComponent } from '../shared-ui/cnaf-button/cnaf-button.component';
import { EventBusService } from '../services/event-bus.service';

@Component({
  selector: 'app-paiements-stable',
  standalone: true,
  imports: [MfeBaseComponent, CnafButtonComponent],
  template: `
    <app-mfe-base
      title="Gestion des Paiements"
      version="1.2.0"
      channel="stable"
      contractVersion="2.1.0"
      icon="payments">
        <p class="text-gray-600 dark:text-gray-300">
          Visualisation de l'historique des paiements et des prochains versements. Version stable et fiable.
        </p>
        <app-cnaf-button (click)="viewHistory()" class="mt-4">
          Voir Historique
        </app-cnaf-button>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementsStableComponent {
  private eventBus = inject(EventBusService);

  // FIX: Changed to static to allow inspection without instantiation.
  public static contract: MfeContract = {
    version: '2.1.0',
    eventsSupported: ['paiement.effectue@1'],
    dependencies: {
        '@angular/core': '17.3.0',
        'rxjs': '7.8.0',
        'd3': '7.9.0'
    }
  };

  viewHistory() {
     this.eventBus.publish({
      source: 'Paiements',
      type: 'paiement.effectue@1',
      payload: { transactionId: 'TX9876', amount: 150.75 }
    });
  }
}
