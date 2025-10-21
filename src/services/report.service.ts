
import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';
import { MfeLoaderService } from './mfe-loader.service';

declare const jspdf: any;

@Injectable({ providedIn: 'root' })
export class ReportService {
  private logger = inject(LoggerService);
  private mfeLoader = inject(MfeLoaderService);

  generatePdfReport() {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const manifest = this.mfeLoader.getManifest();
    const remotes = this.mfeLoader.getAvailableRemotes();
    const logs = this.logger.logs();
    
    const now = new Date();
    const timestamp = now.toISOString();

    // Header
    doc.setFontSize(18);
    doc.text('Kernel C3 - Rapport d\'Audit de Gouvernance', 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le: ${now.toLocaleString()}`, 14, 30);
    doc.text('Entité: CNAF BVA', 14, 36);

    // Manifest Validation
    doc.setFontSize(14);
    doc.text('1. Validation du Manifeste', 14, 50);
    doc.setFontSize(10);
    doc.autoTable({
      startY: 55,
      head: [['État', 'Détail']],
      body: [
        ['Signature (JWS)', 'Vérifiée (simulée)'],
        ['Intégrité (SHA256)', 'Vérifiée (simulée)'],
      ],
      theme: 'grid',
    });

    // Remotes Status
    let finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text('2. État des Remotes Chargés', 14, finalY + 15);

    const remotesBody = remotes.map(remote => {
      const stable = manifest[remote].stable;
      const canary = manifest[remote].canary;
      return [
        remote,
        `Stable: v${stable.version} (Contrat v${stable.contractVersion})\nCanary: ${canary ? `v${canary.version} (Contrat v${canary.contractVersion})` : 'N/A'}`,
        'OK' // Placeholder
      ];
    });

    doc.autoTable({
      startY: finalY + 20,
      head: [['Remote', 'Versions Disponibles', 'État Actuel']],
      body: remotesBody,
      theme: 'striped',
    });

    // Audit Log
    finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text('3. Journal des Événements Récents', 14, finalY + 15);

    const logsBody = logs.slice(0, 20).map(log => [
      log.timestamp.toLocaleTimeString(),
      log.level,
      log.source,
      log.message,
    ]);

    doc.autoTable({
      startY: finalY + 20,
      head: [['Heure', 'Niveau', 'Source', 'Message']],
      body: logsBody,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Rapport_Audit_C3_${timestamp}.pdf`);
    this.logger.success('ReportService', 'Rapport PDF d\'audit généré.');
  }
}
