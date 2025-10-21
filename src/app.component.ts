import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HudComponent } from './components/hud/hud.component';
import { ThemeService } from './services/theme.service';
import { ReportService } from './services/report.service';
import { AuthService } from './services/auth.service';
import { MfeLoaderService } from './services/mfe-loader.service';
import { toSignal } from '@angular/core/rxjs/interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, HudComponent],
})
export class AppComponent {
  // FIX: Explicitly typed the injected Router to resolve potential type inference issues.
  private router: Router = inject(Router);
  themeService = inject(ThemeService);
  reportService = inject(ReportService);
  authService = inject(AuthService);
  mfeLoader = inject(MfeLoaderService);
  
  isHudVisible = signal(true);
  
  // Get remote info from the manifest for building the navigation
  remotes = computed(() => {
    const manifest = this.mfeLoader.getManifest();
    return Object.keys(manifest).map(key => ({
      name: key,
      canaryAvailable: !!manifest[key].canary,
    }));
  });

  // Observe the current route to update the UI (e.g., active links)
  currentRoute = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)),
    { initialValue: null }
  );

  isActive(remoteName: string, channel: 'stable' | 'canary'): boolean {
    if (!this.currentRoute()) return false;
    const url = (this.currentRoute() as NavigationEnd).urlAfterRedirects;
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
    this.router.navigate(['/']); // Navigate to default page after login
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // Navigate away from protected routes
  }
}
