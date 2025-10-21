
import { Injectable, signal } from '@angular/core';

export interface ChaosState {
  networkLatency: number; // in ms
  forceContractMismatch: boolean;
  forcePerfBudgetFail: boolean;
  forceA11yFail: boolean;
  forceHttpBlock: boolean;
  forceRemoteDown: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChaosService {
  state = signal<ChaosState>({
    networkLatency: 0,
    forceContractMismatch: false,
    forcePerfBudgetFail: false,
    forceA11yFail: false,
    forceHttpBlock: false,
    forceRemoteDown: false,
  });

  reset() {
    this.state.set({
      networkLatency: 0,
      forceContractMismatch: false,
      forcePerfBudgetFail: false,
      forceA11yFail: false,
      forceHttpBlock: false,
      forceRemoteDown: false,
    });
  }
}
