
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';

@Component({
  selector: 'app-allocataire-stable',
  standalone: true,
  imports: [MfeBaseComponent],
  template: `
    <app-mfe-base
      title="Dossier Allocataire"
      version="1.2.0"
      channel="stable"
      contractVersion="2.1.0"
      icon="person">
        <p class="text-gray-600 dark:text-gray-300">
          Consultation des informations et droits de l'allocataire. Ce module est stable et respecte toutes les politiques de gouvernance.
        </p>
        <button (click)="callApi('api.cnaf.fr/droits')" class="mt-4 bg-cnaf-blue text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          Vérifier Droits
        </button>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocataireStableComponent {
  // FIX: Changed to static to allow inspection without instantiation.
  public static contract: MfeContract = {
    version: '2.1.0',
    eventsSupported: ['user.data@1'],
    dependencies: {
        '@angular/core': '17.3.0',
        'rxjs': '7.8.0',
    }
  };
}
