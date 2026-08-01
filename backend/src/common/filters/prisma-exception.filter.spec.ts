import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function mockHost() {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const host = { switchToHttp: () => ({ getResponse: () => res }) } as any;
  return { host, res };
}

// Régression : sans ce filtre, une contrainte Prisma non gérée manuellement
// dans chaque service (ex. mettre à jour un enregistrement supprimé)
// remontait comme un 500 brut au client.
describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('traduit P2025 (enregistrement introuvable) en 404', () => {
    const { host, res } = mockHost();
    const err = new Prisma.PrismaClientKnownRequestError('introuvable', { code: 'P2025', clientVersion: '5.22.0' });
    filter.catch(err, host);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('traduit P2002 (contrainte unique) en 409 avec les champs en conflit', () => {
    const { host, res } = mockHost();
    const err = new Prisma.PrismaClientKnownRequestError('doublon', {
      code: 'P2002',
      clientVersion: '5.22.0',
      meta: { target: ['codeSap'] },
    });
    filter.catch(err, host);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('codeSap') }));
  });

  it('traduit P2003 (clé étrangère invalide) en 400', () => {
    const { host, res } = mockHost();
    const err = new Prisma.PrismaClientKnownRequestError('fk', { code: 'P2003', clientVersion: '5.22.0' });
    filter.catch(err, host);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('traduit une PrismaClientValidationError en 400', () => {
    const { host, res } = mockHost();
    const err = new Prisma.PrismaClientValidationError('invalide', { clientVersion: '5.22.0' });
    filter.catch(err, host);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
