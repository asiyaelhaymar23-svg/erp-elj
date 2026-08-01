import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function contexteAvec(role: string | undefined) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('autorise quand aucun rôle n\'est requis sur la route', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(contexteAvec('MAGASIN'))).toBe(true);
  });

  it('autorise un utilisateur dont le rôle fait partie des rôles requis', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['ADMINISTRATEUR', 'MAGASIN']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(contexteAvec('MAGASIN'))).toBe(true);
  });

  it('refuse un utilisateur dont le rôle ne fait pas partie des rôles requis', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['ADMINISTRATEUR']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(contexteAvec('MAGASIN'))).toBe(false);
  });

  it('refuse quand il n\'y a pas d\'utilisateur authentifié', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['ADMINISTRATEUR']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(contexteAvec(undefined))).toBe(false);
  });
});
