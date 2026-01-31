import { JwtStrategy } from './jwt.strategy';

const config = {
  get: (key: string) => (key === 'JWT_ACCESS_SECRET' ? 'access_test' : undefined),
} as any;

describe('JwtStrategy', () => {
  it('mapea payload a usuario', async () => {
    const strategy = new JwtStrategy(config);
    const user = await strategy.validate({
      sub: 'u1',
      email: 'a@b.com',
      roles: ['admin'],
    });

    expect(user).toEqual({ id: 'u1', email: 'a@b.com', roles: ['admin'] });
  });
});
