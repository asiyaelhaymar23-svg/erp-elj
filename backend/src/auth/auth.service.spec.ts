import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('signed-token') };
    service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  });

  describe('validateUser', () => {
    it('rejette un email inconnu', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('inconnu@elj.local', 'x')).rejects.toThrow(UnauthorizedException);
    });

    it('rejette un compte désactivé', async () => {
      prisma.user.findUnique.mockResolvedValue({ isActive: false, passwordHash: 'hash' });
      await expect(service.validateUser('a@elj.local', 'x')).rejects.toThrow(UnauthorizedException);
    });

    it('rejette un mot de passe incorrect', async () => {
      const passwordHash = await bcrypt.hash('BonMdp123', 10);
      prisma.user.findUnique.mockResolvedValue({ isActive: true, passwordHash });
      await expect(service.validateUser('a@elj.local', 'MauvaisMdp')).rejects.toThrow(UnauthorizedException);
    });

    it('retourne l\'utilisateur si les identifiants sont corrects', async () => {
      const passwordHash = await bcrypt.hash('BonMdp123', 10);
      const user = { id: 1, isActive: true, passwordHash, email: 'a@elj.local' };
      prisma.user.findUnique.mockResolvedValue(user);
      await expect(service.validateUser('a@elj.local', 'BonMdp123')).resolves.toEqual(user);
    });
  });

  describe('login', () => {
    it('met à jour lastLoginAt et renvoie un accessToken', async () => {
      const passwordHash = await bcrypt.hash('BonMdp123', 10);
      const user = { id: 1, isActive: true, passwordHash, email: 'a@elj.local', fullName: 'A B', role: 'ADMINISTRATEUR' };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);

      const result = await service.login('a@elj.local', 'BonMdp123');

      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { lastLoginAt: expect.any(Date) } });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 1, email: 'a@elj.local', role: 'ADMINISTRATEUR' });
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 1, email: 'a@elj.local', fullName: 'A B', role: 'ADMINISTRATEUR' },
      });
    });
  });
});
