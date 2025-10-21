import { Injectable, signal, inject } from '@angular/core';
import { TracerService } from './tracer.service';

/**
 * Represents a strongly-typed event for inter-MFE communication.
 */
export interface MfeEvent {
  source: string;
  type: string;
  payload: unknown;
}

/**
 * ARCHITECTURAL NOTE: Inter-MFE Event Bus
 * This service provides a decoupled communication channel for the entire MFE ecosystem.
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSignal = signal<MfeEvent | null>(null);
  private tracer = inject(TracerService);

  /** A read-only signal representing the most recent event published to the bus. */
  public readonly lastEvent = this.eventSignal.asReadonly();

  /**
   * Publishes an event to the entire application.
   * @param event The event to be broadcast.
   */
  publish(event: MfeEvent) {
    this.tracer.trace({
      source: event.source,
      target: 'EventBus',
      type: 'Publish',
      status: 'SUCCESS',
      payload: event
    });
    this.eventSignal.set(event);
  }
}
