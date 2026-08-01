import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SortiesService } from './sorties.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SortiesService', () => {
  let service: SortiesService;
  let prisma: any;

  beforeEach(() => {
    const tx = {
      articlePdr: { findUnique: jest.fn(), update: jest.fn() },
      sortie: { create: jest.fn(), update: jest.fn() },
    };
    prisma = {
      sortie: { findUnique: jest.fn() },
      $transaction: jest.fn((cb) => cb(tx)),
      _tx: tx,
    };
    service = new SortiesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('refuse une sortie si le stock disponible est insuffisant', async () => {
      prisma._tx.articlePdr.findUnique.mockResolvedValue({ id: 1, designation: 'Roulement', stockActuel: 2 });
      await expect(
        service.create({ articleId: 1, quantite: 5, dateSortie: '2026-01-01' } as any, 1),
      ).rejects.toThrow(BadRequestException);
      expect(prisma._tx.sortie.create).not.toHaveBeenCalled();
    });

    it('lève une NotFoundException si l\'article référencé n\'existe pas', async () => {
      prisma._tx.articlePdr.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ articleId: 999, quantite: 1, dateSortie: '2026-01-01' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('décrémente le stock quand la quantité demandée est disponible', async () => {
      prisma._tx.articlePdr.findUnique.mockResolvedValue({ id: 1, designation: 'Roulement', stockActuel: 10 });
      prisma._tx.sortie.create.mockResolvedValue({ id: 1 });
      await service.create({ articleId: 1, quantite: 4, dateSortie: '2026-01-01' } as any, 1);
      expect(prisma._tx.articlePdr.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stockActuel: { decrement: 4 } },
      });
    });
  });

  describe('marquerRetour', () => {
    it('refuse un second retour sur une sortie déjà traitée', async () => {
      prisma.sortie.findUnique.mockResolvedValue({ id: 1, quantite: 5, statut: 'RETOURNE', articleId: 1 });
      await expect(service.marquerRetour(1, { dateRetourReelle: '2026-01-05' } as any)).rejects.toThrow(BadRequestException);
    });

    it('refuse une quantité retournée supérieure à la quantité sortie', async () => {
      prisma.sortie.findUnique.mockResolvedValue({ id: 1, quantite: 5, statut: 'EN_ATTENTE', articleId: 1 });
      await expect(
        service.marquerRetour(1, { dateRetourReelle: '2026-01-05', quantiteRetournee: 999 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('réintègre la quantité au stock pour un retour valide', async () => {
      prisma.sortie.findUnique.mockResolvedValue({ id: 1, quantite: 5, statut: 'EN_ATTENTE', articleId: 1 });
      prisma._tx.sortie.update.mockResolvedValue({ id: 1, statut: 'RETOURNE' });
      await service.marquerRetour(1, { dateRetourReelle: '2026-01-05', quantiteRetournee: 5 } as any);
      expect(prisma._tx.articlePdr.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stockActuel: { increment: 5 } },
      });
    });
  });
});
