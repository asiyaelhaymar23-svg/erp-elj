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
});
