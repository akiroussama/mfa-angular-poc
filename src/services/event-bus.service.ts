import { Injectable, signal } from '@angular/core';

/**
 * Represents a strongly-typed event for inter-MFE communication.
 * - `source`: The name of the MFE that dispatched the event.
 * - `type`: A namespaced event type, e.g., 'paiement.selectionne@1'. The version suffix is a good practice for contract evolution.
 * - `payload`: The data associated with the event.
 */
export interface MfeEvent {
  source: string;
  type: string;
  payload: unknown;
}

/**
 * ARCHITECTURAL NOTE: Inter-MFE Event Bus
 *
 * This service provides a decoupled communication channel for the entire MFE ecosystem.
 * It's a fundamental pattern for preventing direct dependencies between remote applications.
 *
 * - Signal-based: Using a signal is a modern, efficient way to broadcast events in a zoneless application.
 * - Singleton (`providedIn: 'root'`): Ensures all parts of the application (Shell and all MFEs) share the exact same instance.
 * - Type-Safe: The `MfeEvent` interface enforces a consistent structure for all events.
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSignal = signal<MfeEvent | null>(null);

  /** A read-only signal representing the most recent event published to the bus. */
  public readonly lastEvent = this.eventSignal.asReadonly();

  /**
   * Publishes an event to the entire application.
   * @param event The event to be broadcast.
   */
  publish(event: MfeEvent) {
    this.eventSignal.set(event);
  }
}
