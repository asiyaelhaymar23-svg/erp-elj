import { NotFoundException } from '@nestjs/common';
import { PdrService } from './pdr.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PdrService', () => {
  let service: PdrService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      articlePdr: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
      user: { findMany: jest.fn().mockResolvedValue([]) },
      notification: { createMany: jest.fn() },
      historique: { create: jest.fn() },
    };
    service = new PdrService(prisma as unknown as PrismaService);
  });

  // Le statut n'est jamais saisi manuellement : ces cas couvrent les quatre
  // branches de PdrService.computeStatut() via create().
  it.each([
    [0, 5, 20, 'RUPTURE'],
    [3, 5, 20, 'CRITIQUE'],
    [10, 5, 20, 'NORMAL'],
    [25, 5, 20, 'SURSTOCK'],
    [10, 5, 0, 'NORMAL'], // stockMax=0 => pas de surstock possible
  ])('stockActuel=%i, stockMin=%i, stockMax=%i => %s', async (stockActuel, stockMin, stockMax, statutAttendu) => {
    prisma.articlePdr.create.mockResolvedValue({ id: 1, stockActuel, stockMin, stockMax, statut: statutAttendu });
    prisma.articlePdr.findUnique.mockResolvedValue({ id: 1, statut: statutAttendu, designation: 'Test', codeSap: 'X1' });

    await service.create({ codeSap: 'X1', designation: 'Test', stockActuel, stockMin, stockMax } as any, 1);

    expect(prisma.articlePdr.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ statut: statutAttendu }),
    });
  });

  it('lève une NotFoundException si l\'article est introuvable', async () => {
    prisma.articlePdr.findUnique.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  describe('importFromRows', () => {
    it('crée un nouvel article si le codeSap est inconnu', async () => {
      prisma.articlePdr.findUnique.mockImplementation(({ where }: any) =>
        where.codeSap
          ? Promise.resolve(null)
          : Promise.resolve({ id: 1, statut: 'NORMAL', designation: 'Nouveau', codeSap: 'NEW-1' }),
      );
      prisma.articlePdr.create.mockResolvedValue({ id: 1, codeSap: 'NEW-1', designation: 'Nouveau', statut: 'NORMAL' });

      const result = await service.importFromRows([{ codeSap: 'NEW-1', designation: 'Nouveau', stockActuel: 10 }], 1);

      expect(result).toEqual({ created: 1, updated: 0, errors: [] });
      expect(prisma.articlePdr.create).toHaveBeenCalled();
      expect(prisma.articlePdr.update).not.toHaveBeenCalled();
    });

    it('met à jour un article existant (upsert sur codeSap) plutôt que de le dupliquer', async () => {
      prisma.articlePdr.findUnique.mockImplementation(({ where }: any) =>
        where.codeSap
          ? Promise.resolve({ id: 5, codeSap: 'EXIST-1', stockActuel: 3, stockMin: 5, stockMax: 20 })
          : Promise.resolve({ id: 5, statut: 'CRITIQUE', designation: 'Existant', codeSap: 'EXIST-1' }),
      );
      prisma.articlePdr.update.mockResolvedValue({ id: 5, codeSap: 'EXIST-1', statut: 'NORMAL' });

      const result = await service.importFromRows([{ codeSap: 'EXIST-1', designation: 'Existant', stockActuel: 10 }], 1);

      expect(result).toEqual({ created: 0, updated: 1, errors: [] });
      expect(prisma.articlePdr.update).toHaveBeenCalled();
      expect(prisma.articlePdr.create).not.toHaveBeenCalled();
    });

    it('rapporte une erreur par ligne (ex. codeSap manquant) sans faire échouer tout le fichier', async () => {
      prisma.articlePdr.findUnique.mockImplementation(({ where }: any) =>
        where.codeSap
          ? Promise.resolve(null)
          : Promise.resolve({ id: 2, statut: 'NORMAL', designation: 'OK', codeSap: 'OK-1' }),
      );
      prisma.articlePdr.create.mockResolvedValue({ id: 2, codeSap: 'OK-1', designation: 'OK', statut: 'NORMAL' });

      const result = await service.importFromRows(
        [{ codeSap: 'OK-1', designation: 'OK', stockActuel: 1 }, { designation: 'Sans code' }],
        1,
      );

      expect(result.created).toBe(1);
      expect(result.errors).toEqual([{ row: 3, error: 'codeSap manquant' }]);
    });
  });
});
