
import { Injectable, signal, inject, effect } from '@angular/core';
import { EventBusService } from './event-bus.service';

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  source: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  logs = signal<LogEntry[]>([]);
  private eventBus = inject(EventBusService);

  constructor() {
    // Automatically log events from the event bus
    effect(() => {
      const event = this.eventBus.lastEvent();
      if (event) {
        this.log(event.source, `EVENT [${event.type}]: ${JSON.stringify(event.payload)}`);
      }
    });
  }

  log(source: string, message: string) {
    this.addLog('INFO', source, message);
  }

  warn(source: string, message: string) {
    this.addLog('WARN', source, message);
  }

  error(source: string, message: string) {
    this.addLog('ERROR', source, message);
  }

  success(source: string, message: string) {
    this.addLog('SUCCESS', source, message);
  }

  private addLog(level: LogEntry['level'], source: string, message: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      source,
      message,
    };
    this.logs.update(currentLogs => [entry, ...currentLogs.slice(0, 99)]); // Keep last 100 logs
    console.log(`[${level}] ${source}: ${message}`);
  }
}
