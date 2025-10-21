import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ARCHITECTURAL NOTE: Shared Design System Component
 * 
 * This component is a foundational element of a shared UI library or Design System.
 * In a large, multi-team MFE ecosystem, a shared library of components is critical for:
 * - UI/UX Consistency: Ensures all applications have a unified look and feel.
 * - Reducing Duplication: Prevents each team from rebuilding common components like buttons, inputs, etc.
 * - Accessibility (A11y): Allows accessibility best practices to be implemented once and reused everywhere.
 * - Faster Development: Teams can build features faster by composing UIs from a pre-built, robust set of components.
 */
@Component({
  selector: 'app-cnaf-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="buttonClasses()">
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnafButtonComponent {
  variant = input<'primary' | 'secondary'>('primary');

  baseClasses = 'px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

  buttonClasses = () => {
    if (this.variant() === 'primary') {
      return `${this.baseClasses} bg-cnaf-blue text-white hover:bg-blue-700 focus:ring-cnaf-blue`;
    }
    return `${this.baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 focus:ring-gray-500`;
  }
}
