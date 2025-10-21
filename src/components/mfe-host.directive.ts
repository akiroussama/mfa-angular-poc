
import { Directive, ViewContainerRef } from '@angular/core';

/**
 * ARCHITECTURAL NOTE: This directive was used in the initial version for manual
 * component loading. With the move to a more robust, router-based architecture,
 * this is no longer needed as the <router-outlet> now serves as the host.
 *
 * It is kept here as an artifact to discuss the architectural evolution.
 */
@Directive({
  selector: '[mfeHost]',
})
export class MfeHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
