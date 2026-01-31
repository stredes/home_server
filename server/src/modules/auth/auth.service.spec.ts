import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

const config = {
  get: (key: string) => {
    if (key === 'JWT_ACCESS_SECRET') return 'access_test';
    if (key === 'JWT_REFRESH_SECRET') return 'refresh_test';
    if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
    if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
    return undefined;
  },
} as any;

describe('AuthService', () => {
  it('firma access y refresh tokens', async () => {
    const jwtService = new JwtService({ secret: 'access_test' });
    const usersService = { findByEmail: jest.fn() } as any;

    const service = new AuthService(jwtService, config, usersService);

    const tokens = await service.signTokens({
      id: 'u1',
      email: 'a@b.com',
      roles: ['admin'],
    });

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('refresca tokens desde refresh token', async () => {
    const jwtService = new JwtService({ secret: 'refresh_test' });
    const usersService = { findByEmail: jest.fn() } as any;

    const service = new AuthService(jwtService, config, usersService);
    const refresh = await jwtService.signAsync(
      { sub: 'u1', email: 'a@b.com', roles: ['admin'] },
      { secret: 'refresh_test' },
    );

    const tokens = await service.refreshTokens(refresh);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });
});
