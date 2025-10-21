
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';

@Component({
  selector: 'app-paiements-stable',
  standalone: true,
  imports: [MfeBaseComponent],
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
        <button (click)="callApi('api.cnaf.fr/paiements')" class="mt-4 bg-cnaf-blue text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          Voir Historique
        </button>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementsStableComponent {
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
}
