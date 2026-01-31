import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('login firma tokens y setea cookie', async () => {
    const authService = {
      validateUser: jest.fn().mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        roles: ['admin'],
      }),
      signTokens: jest
        .fn()
        .mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' }),
    } as unknown as AuthService;

    const res = { cookie: jest.fn() } as any;
    const controller = new AuthController(authService);

    const result = await controller.login(
      { email: 'a@b.com', password: '123456' },
      res,
    );

    expect(authService.validateUser).toHaveBeenCalled();
    expect(authService.signTokens).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(result.accessToken).toBe('acc');
  });

  it('refresh genera nuevos tokens', async () => {
    const authService = {
      refreshTokens: jest
        .fn()
        .mockResolvedValue({ accessToken: 'acc2', refreshToken: 'ref2' }),
    } as unknown as AuthService;

    const res = { cookie: jest.fn() } as any;
    const controller = new AuthController(authService);

    const result = await controller.refresh('ref1', {}, res);

    expect(authService.refreshTokens).toHaveBeenCalledWith('ref1');
    expect(res.cookie).toHaveBeenCalled();
    expect(result.accessToken).toBe('acc2');
  });

  it('logout limpia cookie', async () => {
    const authService = {} as AuthService;
    const res = { clearCookie: jest.fn() } as any;
    const controller = new AuthController(authService);

    const result = await controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
    expect(result.ok).toBe(true);
  });
});
