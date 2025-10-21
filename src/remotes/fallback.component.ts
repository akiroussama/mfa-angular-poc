
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MfeComponent } from '../contracts/mfe.contracts';

@Component({
  selector: 'app-fallback',
  standalone: true,
  template: `
    <div class="rounded-lg shadow-md bg-red-100 dark:bg-red-900 border border-red-400 p-6">
      <div class="flex items-center space-x-3">
        <span class="material-symbols-outlined text-red-600 dark:text-red-300 text-3xl">error</span>
        <div>
          <h3 class="text-lg font-bold text-red-800 dark:text-red-200">Erreur de chargement du module</h3>
          <p class="text-red-700 dark:text-red-300 text-sm">
            Le module applicatif n'a pas pu être chargé. Une version de secours ou stable est peut-être affichée.
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FallbackComponent extends MfeComponent {}
