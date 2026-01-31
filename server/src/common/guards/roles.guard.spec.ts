import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const makeContext = (roles: string[]) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as unknown as ExecutionContext;

  it('permite cuando no hay roles requeridos', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as any;
    const guard = new RolesGuard(reflector as Reflector);

    expect(guard.canActivate(makeContext(['admin']))).toBe(true);
  });

  it('permite si el usuario tiene el rol requerido', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as any;
    const guard = new RolesGuard(reflector as Reflector);

    expect(guard.canActivate(makeContext(['admin', 'lector']))).toBe(true);
  });

  it('bloquea si el usuario no tiene el rol requerido', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as any;
    const guard = new RolesGuard(reflector as Reflector);

    expect(guard.canActivate(makeContext(['lector']))).toBe(false);
  });
});
