
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[mfeHost]',
})
export class MfeHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
