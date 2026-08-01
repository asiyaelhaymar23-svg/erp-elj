import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  private async donneesSynthese() {
    const [pdr, depensesParSecteur, sortiesEnRetard, daStats] = await Promise.all([
      this.prisma.articlePdr.groupBy({ by: ['statut'], _count: true }),
      this.prisma.depense.groupBy({ by: ['secteur'], _sum: { montant: true } }),
      this.prisma.sortie.findMany({ where: { statut: { not: 'RETOURNE' } }, include: { article: true } }),
      this.prisma.demandeAchat.groupBy({ by: ['statut'], _count: true }),
    ]);
    return { pdr, depensesParSecteur, sortiesEnRetard, daStats };
  }

  // Un classeur, un onglet par module — calculé à la demande à partir des
  // données réelles, jamais un total figé.
  async genererRapportSynthese() {
    const { pdr, depensesParSecteur, sortiesEnRetard, daStats } = await this.donneesSynthese();

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(pdr), 'PDR - Statuts');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(depensesParSecteur.map((d) => ({ secteur: d.secteur, montant: d._sum.montant }))), 'Depenses par secteur');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sortiesEnRetard), 'Sorties en cours');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(daStats), 'DA - Statuts');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Même synthèse que l'export Excel, mise en page pour lecture rapide /
  // impression plutôt que pour retraitement tabulaire.
  async genererRapportSynthesePdf(): Promise<Buffer> {
    const { pdr, depensesParSecteur, sortiesEnRetard, daStats } = await this.donneesSynthese();

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const pageSize: [number, number] = [595.28, 841.89]; // A4
    const marge = 50;

    let page = doc.addPage(pageSize);
    let y = pageSize[1] - marge;

    const nouvellePageSiNecessaire = (hauteurRequise: number) => {
      if (y - hauteurRequise < marge) {
        page = doc.addPage(pageSize);
        y = pageSize[1] - marge;
      }
    };

    const titre = (texte: string) => {
      nouvellePageSiNecessaire(28);
      page.drawText(texte, { x: marge, y, size: 14, font: bold, color: rgb(0.13, 0.15, 0.17) });
      y -= 22;
    };

    const sousTitre = (texte: string) => {
      nouvellePageSiNecessaire(20);
      page.drawText(texte, { x: marge, y, size: 11, font: bold, color: rgb(0.72, 0.31, 0.06) });
      y -= 16;
    };

    const ligne = (texte: string) => {
      nouvellePageSiNecessaire(14);
      page.drawText(texte, { x: marge, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 14;
    };

    titre('Portail Suivis Service Électrique ELJ — Rapport de synthèse');
    ligne(`Généré le ${new Date().toLocaleString('fr-FR')}`);
    y -= 8;

    sousTitre('Articles PDR par statut de stock');
    if (pdr.length === 0) ligne('Aucun article.');
    for (const p of pdr) ligne(`${p.statut} : ${p._count} article(s)`);
    y -= 8;

    sousTitre('Dépenses par secteur');
    if (depensesParSecteur.length === 0) ligne('Aucune dépense.');
    for (const d of depensesParSecteur) ligne(`${d.secteur} : ${Number(d._sum.montant ?? 0).toLocaleString('fr-FR')} DH`);
    y -= 8;

    sousTitre(`Sorties en cours (non retournées) — ${sortiesEnRetard.length}`);
    if (sortiesEnRetard.length === 0) ligne('Aucune sortie en cours.');
    for (const s of sortiesEnRetard.slice(0, 40)) {
      ligne(`${s.article?.designation ?? 'Article #' + s.articleId} — qté ${s.quantite} — ${s.statut}`);
    }
    if (sortiesEnRetard.length > 40) ligne(`… et ${sortiesEnRetard.length - 40} autre(s).`);
    y -= 8;

    sousTitre('Demandes d\'achat par statut');
    if (daStats.length === 0) ligne('Aucune DA.');
    for (const d of daStats) ligne(`${d.statut} : ${d._count} demande(s)`);

    const bytes = await doc.save();
    return Buffer.from(bytes);
  }
}
