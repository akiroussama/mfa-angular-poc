
import { Component, ChangeDetectionStrategy, signal, inject, ViewContainerRef, AfterViewInit, ComponentRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HudComponent } from './components/hud/hud.component';
import { MfeHostDirective } from './components/mfe-host.directive';
import { MfeLoaderService, MfeState } from './services/mfe-loader.service';
import { ThemeService } from './services/theme.service';
import { ReportService } from './services/report.service';
import { Mfe, MfeComponent } from './contracts/mfe.contracts';
import { LoggerService } from './services/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HudComponent, MfeHostDirective],
})
export class AppComponent implements AfterViewInit {
  private mfeLoader = inject(MfeLoaderService);
  themeService = inject(ThemeService);
  reportService = inject(ReportService);
  logger = inject(LoggerService);

  mfeHost = viewChild.required(MfeHostDirective);

  mfeRegistry: { [key: string]: MfeState } = {
    'allocataire': { channel: 'stable', loadedComponent: null },
    'paiements': { channel: 'stable', loadedComponent: null }
  };

  availableRemotes = this.mfeLoader.getAvailableRemotes();
  
  isHudVisible = signal(true);
  
  ngAfterViewInit() {
    // Load initial stable remotes
    this.loadRemote('allocataire', 'stable');
    this.loadRemote('paiements', 'stable');
  }

  loadRemote(remoteName: string, channel: 'stable' | 'canary') {
    this.mfeRegistry[remoteName].channel = channel;
    const viewContainerRef = this.mfeHost().viewContainerRef;

    // Find and destroy the old component if it exists
    const existingComponentRef = this.mfeRegistry[remoteName].loadedComponent;
    if (existingComponentRef) {
      // FIX: Use destroy() to prevent memory leaks. It also automatically detaches the view.
      existingComponentRef.destroy();
      this.mfeRegistry[remoteName].loadedComponent = null;
    }

    this.mfeLoader.loadMfe(remoteName, channel).then(componentType => {
      const componentRef = viewContainerRef.createComponent(componentType);
      componentRef.instance.mfeId = remoteName;
      this.mfeRegistry[remoteName].loadedComponent = componentRef;
    }).catch(err => {
      this.logger.error('Shell', `Failed to load remote ${remoteName}@${channel}. Reason: ${err.message}`);
    });
  }

  toggleHud() {
    this.isHudVisible.update(v => !v);
  }

  exportAuditReport() {
    this.reportService.generatePdfReport();
  }
}
