import { Injectable, signal } from '@angular/core';

export type TraceNode = 'UserAction' | 'Router' | 'AuthGuard' | 'PolicyGuard' | 'EventBus' | 'allocataire@stable' | 'paiements@stable' | 'paiements@canary' | 'Shell';
export type TraceStatus = 'SUCCESS' | 'WARN' | 'ERROR';
export type TraceType = 'Trigger' | 'Check' | 'Result' | 'Load' | 'Cancel' | 'Error' | 'Publish' | 'Action';

export interface TraceEvent {
  id: number;
  timestamp: number;
  source: TraceNode | string; // Allow custom string sources for MFEs
  target: TraceNode | string;
  type: TraceType;
  status: TraceStatus;
  payload?: unknown;
}

/**
 * ARCHITECTURAL NOTE: Tracer Service
 * This service is the central nervous system for the "Live Architectural Visualization" feature.
 * It's a specialized, high-level event bus designed specifically for capturing and broadcasting
 * key architectural events, distinct from the business-level `EventBusService`.
 *
 * - Decoupled Instrumentation: Services and components don't need to know about the visualizer;
 *   they just report events to this central service.
 * - Structured Events: The `TraceEvent` interface enforces a rich, structured format for events,
 *   which is essential for creating meaningful visualizations.
 * - Signal-based State: Exposes the event history as a signal, making it trivial for the
 *   visualizer component to react to new events in a performant, zoneless-friendly way.
 */
@Injectable({ providedIn: 'root' })
export class TracerService {
  private eventCounter = 0;
  private eventHistory = signal<TraceEvent[]>([]);

  public readonly events = this.eventHistory.asReadonly();

  /**
   * Records a new architectural event.
   * @param event The event details to record.
   */
  trace(event: Omit<TraceEvent, 'id' | 'timestamp'>) {
    const newEvent: TraceEvent = {
      id: this.eventCounter++,
      timestamp: Date.now(),
      ...event
    };
    this.eventHistory.update(history => [newEvent, ...history.slice(0, 49)]); // Keep last 50 events
  }

  /**
   * Clears all traced events from history.
   */
  clear() {
    this.eventHistory.set([]);
  }
}
