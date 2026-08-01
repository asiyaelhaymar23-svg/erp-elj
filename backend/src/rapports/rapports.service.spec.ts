import { RapportsService } from './rapports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RapportsService', () => {
  let service: RapportsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      articlePdr: { groupBy: jest.fn().mockResolvedValue([{ statut: 'CRITIQUE', _count: 2 }]) },
      depense: { groupBy: jest.fn().mockResolvedValue([{ secteur: 'Four', _sum: { montant: 123456.78 } }]) },
      sortie: { findMany: jest.fn().mockResolvedValue([]) },
      demandeAchat: { groupBy: jest.fn().mockResolvedValue([{ statut: 'N', _count: 1 }]) },
    };
    service = new RapportsService(prisma as unknown as PrismaService);
  });

  // Régression : pdf-lib (police standard WinAnsi) ne peut pas encoder
  // l'espace fine que toLocaleString('fr-FR') insère comme séparateur de
  // milliers dès qu'un montant atteint 1000 — ça faisait planter tout
  // l'export PDF ("WinAnsi cannot encode... 0x202f").
  it('génère un PDF valide même avec un montant >= 1000 (séparateur de milliers fr-FR)', async () => {
    const buffer = await service.genererRapportSynthesePdf();
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('produit un classeur Excel avec les mêmes données', async () => {
    const buffer = await service.genererRapportSynthese();
    expect(buffer.length).toBeGreaterThan(0);
  });
});
