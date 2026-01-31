import { UsersService } from './users.service';

describe('UsersService', () => {
  it('hashea el password al crear usuario', async () => {
    const prisma = {
      user: {
        create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
        findUnique: jest.fn(),
      },
    } as any;

    const service = new UsersService(prisma);

    await service.create({
      email: 'a@b.com',
      password: 'plain',
      nombre: 'Ana',
      roles: [],
    });

    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe('plain');
  });

  it('busca usuario por email', async () => {
    const prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ id: 'u2', email: 'x@y.com' }),
      },
    } as any;

    const service = new UsersService(prisma);

    const user = await service.findByEmail('x@y.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'x@y.com' },
      include: { roles: { include: { role: true } } },
    });
    expect(user?.email).toBe('x@y.com');
  });
});
