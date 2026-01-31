import { of } from 'rxjs';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  it('registra log cuando hay metadata', async () => {
    const prisma = {
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    } as any;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({ action: 'LOGIN', entity: 'Auth' }),
    } as unknown as Reflector;

    const interceptor = new AuditInterceptor(prisma, reflector);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1' },
          ip: '127.0.0.1',
          headers: { 'user-agent': 'test' },
        }),
      }),
    } as unknown as ExecutionContext;

    await new Promise((resolve) => {
      interceptor.intercept(context, { handle: () => of({ ok: true }) }).subscribe(() => resolve(null));
    });

    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
