
import { Injectable, signal, effect, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isHighContrast = signal(false);
  isLargeText = signal(false);

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      this.document.body.classList.toggle('high-contrast', this.isHighContrast());
      this.document.body.classList.toggle('large-text', this.isLargeText());
    });
  }

  toggleHighContrast() {
    this.isHighContrast.update(v => !v);
  }

  toggleLargeText() {
    this.isLargeText.update(v => !v);
  }
}
