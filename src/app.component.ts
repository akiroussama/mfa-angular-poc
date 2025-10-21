import { Component, ChangeDetectionStrategy, signal, inject, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd, NavigationStart, NavigationCancel, NavigationError, GuardsCheckStart, GuardsCheckEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HudComponent } from './components/hud/hud.component';
import { ThemeService } from './services/theme.service';
import { ReportService } from './services/report.service';
import { AuthService } from './services/auth.service';
import { MfeLoaderService } from './services/mfe-loader.service';
import { toSignal } from '@angular/core/rxjs/interop';
import { TracerService } from './services/tracer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, HudComponent],
})
export class AppComponent {
  private router: Router = inject(Router);
  themeService = inject(ThemeService);
  reportService = inject(ReportService);
  authService = inject(AuthService);
  mfeLoader = inject(MfeLoaderService);
  tracer = inject(TracerService);
  
  isHudVisible = signal(true);
  
  remotes = computed(() => {
    const manifest = this.mfeLoader.getManifest();
    return Object.keys(manifest).map(key => ({
      name: key,
      canaryAvailable: !!manifest[key].canary,
    }));
  });

  currentRouteSignal = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)),
    { initialValue: null }
  );

  constructor() {
    // After the next render, subscribe to router events for tracing.
    // This ensures that the component view is initialized before we start tracing.
    afterNextRender(() => {
        this.traceRouterEvents();
    });
  }

  isActive(remoteName: string, channel: 'stable' | 'canary'): boolean {
    if (!this.currentRouteSignal()) return false;
    const url = (this.currentRouteSignal() as NavigationEnd).urlAfterRedirects;
    return url.includes(`/${remoteName}/${channel}`);
  }

  toggleHud() {
    this.isHudVisible.update(v => !v);
  }

  exportAuditReport() {
    this.reportService.generatePdfReport();
  }

  login() {
    this.authService.login({ name: 'agent-007', roles: ['admin'] });
    this.router.navigate(['/']); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); 
  }

  // Instrument the router to trace its lifecycle events.
  private traceRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.tracer.trace({
          source: 'UserAction',
          target: 'Router',
          type: 'Trigger',
          status: 'SUCCESS',
          payload: { event: 'NavigationStart', url: event.url }
        });
      }
      if (event instanceof NavigationEnd) {
        this.tracer.trace({
          source: 'Router',
          target: this.findActiveMfe(event.urlAfterRedirects) || 'Shell',
          type: 'Load',
          status: 'SUCCESS',
          payload: { event: 'NavigationEnd', url: event.urlAfterRedirects }
        });
      }
      if (event instanceof NavigationCancel) {
        this.tracer.trace({
          source: 'Router',
          target: 'Router',
          type: 'Cancel',
          status: 'WARN',
          payload: { event: 'NavigationCancel', reason: event.reason }
        });
      }
       if (event instanceof NavigationError) {
        this.tracer.trace({
          source: 'Router',
          target: 'Router',
          type: 'Error',
          status: 'ERROR',
          payload: { event: 'NavigationError', error: event.error }
        });
      }
    });
  }

  private findActiveMfe(url: string): string | null {
    const segments = url.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const remoteName = segments[0];
      const channel = segments[1];
      if (this.remotes().some(r => r.name === remoteName)) {
        return `${remoteName}@${channel}`;
      }
    }
    return null;
  }
}
