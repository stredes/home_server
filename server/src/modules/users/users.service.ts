import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  nombre: string;
  roles: string[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Crea usuario con hash seguro y roles iniciales.
  async create(input: CreateUserInput) {
    const passwordHash = await argon2.hash(input.password);

    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        nombre: input.nombre,
        roles: {
          create: input.roles.map((roleName) => ({
            role: { connect: { name: roleName } },
          })),
        },
      },
    });
  }

  // Lista usuarios con paginación básica.
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { roles: { include: { role: true } } },
      }),
      this.prisma.user.count(),
    ]);

    return { items, total, page, limit };
  }

  // Busca usuario con roles para autenticación y RBAC.
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  }

  // Reemplaza roles de un usuario.
  async setRoles(userId: string, roles: string[]) {
    await this.prisma.userRole.deleteMany({ where: { userId } });
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          create: roles.map((roleName) => ({
            role: { connect: { name: roleName } },
          })),
        },
      },
    });
  }
}
