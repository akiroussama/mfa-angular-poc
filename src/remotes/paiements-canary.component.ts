
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';

@Component({
  selector: 'app-paiements-canary',
  standalone: true,
  imports: [MfeBaseComponent],
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
            <button (click)="callApi('api.cnaf.fr/paiements/previsions')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm">
              Voir Prévisions
            </button>
             <button (click)="callApi('test.api.cnaf.fr/paiements/realtime')" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm">
              API de test
            </button>
        </div>
      </div>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementsCanaryComponent {
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
}
