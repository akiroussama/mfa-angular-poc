
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MfeContract } from '../contracts/mfe.contracts';
import { MfeBaseComponent } from './mfe.model';
import { CnafButtonComponent } from '../shared-ui/cnaf-button/cnaf-button.component';
import { EventBusService } from '../services/event-bus.service';

@Component({
  selector: 'app-allocataire-stable',
  standalone: true,
  imports: [MfeBaseComponent, CnafButtonComponent],
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
        <div class="flex items-center space-x-2 mt-4">
            <app-cnaf-button (click)="checkRights()" variant="primary">
              Vérifier Droits
            </app-cnaf-button>
             <app-cnaf-button (click)="publishEvent()" variant="secondary">
              Publish Event
            </app-cnaf-button>
        </div>
    </app-mfe-base>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocataireStableComponent {
  private eventBus = inject(EventBusService);

  // FIX: Changed to static to allow inspection without instantiation.
  public static contract: MfeContract = {
    version: '2.1.0',
    eventsSupported: ['user.data@1', 'droits.verifies@1'],
    dependencies: {
        '@angular/core': '17.3.0',
        'rxjs': '7.8.0',
    }
  };

  checkRights() {
    // In a real app, this would call an API.
    // Here, we just publish an event to the bus.
     this.eventBus.publish({
      source: 'Allocataire',
      type: 'droits.verifies@1',
      payload: { allocataireId: '12345', status: 'OK' }
    });
  }

  publishEvent() {
    this.eventBus.publish({
      source: 'Allocataire',
      type: 'user.data@1',
      payload: { message: 'Hello from Allocataire MFE!' }
    });
  }
}
