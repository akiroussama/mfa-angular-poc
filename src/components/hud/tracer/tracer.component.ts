import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TracerService, TraceNode, TraceEvent } from '../../../services/tracer.service';

type NodeState = 'idle' | 'active' | 'success' | 'error';
type LinkState = 'idle' | 'active';

@Component({
  selector: 'app-tracer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracer.component.html',
  styleUrls: ['./tracer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TracerComponent {
  tracerService = inject(TracerService);
  
  // Signals to hold the current state of each node and link in the diagram
  nodeStates = signal<Record<string, NodeState>>({});
  linkStates = signal<Record<string, LinkState>>({});
  lastEventMessage = signal<string>('');

  constructor() {
    effect(() => {
      const events = this.tracerService.events();
      if (events.length > 0) {
        this.processEvent(events[0]);
      }
    }, { allowSignalWrites: true });
  }

  private processEvent(event: TraceEvent) {
    const sourceNode = this.normalizeNodeId(event.source);
    const targetNode = this.normalizeNodeId(event.target);
    const linkId = `${sourceNode}-${targetNode}`;

    // Update node states
    this.nodeStates.update(states => {
      const newStates = { ...states };
      Object.keys(newStates).forEach(k => newStates[k] = 'idle'); // Reset all
      
      newStates[sourceNode] = 'active';
      newStates[targetNode] = 'active';

      if (event.type === 'Result' || event.type === 'Load') {
        if (event.status === 'SUCCESS') newStates[sourceNode] = 'success';
        if (event.status === 'ERROR' || event.status === 'WARN') newStates[sourceNode] = 'error';
      }
       if (event.type === 'Load' && event.status === 'SUCCESS') {
           newStates[targetNode] = 'success'; // Mark the loaded MFE
       }


      return newStates;
    });

    // Update link states
    this.linkStates.update(states => ({
      [linkId]: 'active'
    }));
    
    // Set a user-friendly message
    this.lastEventMessage.set(this.formatEventMessage(event));

    // Reset animations after a delay
    setTimeout(() => {
      this.nodeStates.update(states => {
        const newStates = { ...states };
        // Keep loaded MFE active-looking
        if (event.type === 'Load' && event.status === 'SUCCESS') {
            newStates[this.normalizeNodeId(event.target)] = 'active';
        } else {
             Object.keys(newStates).forEach(k => newStates[k] = 'idle');
        }
        return newStates;
      });
      this.linkStates.set({});
    }, 1500);
  }

  private normalizeNodeId(id: string): string {
    return id.replace(/@/g, '_').replace(/-/g, '_');
  }

  private formatEventMessage(event: TraceEvent): string {
      const payload = event.payload as any;
      switch (event.type) {
          case 'Trigger': return `User triggered navigation to ${payload.url}`;
          case 'Check': return `${event.target} started checks...`;
          case 'Result': return `${event.source} returned '${payload.result}' ${payload.reason ? `(Reason: ${payload.reason})` : ''}`;
          case 'Load': return `Router successfully loaded ${event.target}`;
          case 'Action': return `PolicyGuard initiated ${payload.action} to ${payload.to} (Reason: ${payload.reason})`;
          case 'Publish': return `${event.source} published event '${payload.type}' to EventBus`;
          default: return `Event: ${event.type} from ${event.source} to ${event.target}`;
      }
  }
}
