import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string) {
    return this.prisma.role.create({ data: { name } });
  }
}
