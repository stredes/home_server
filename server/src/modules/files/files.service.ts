import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { CreateFileDto } from './dto/create-file.dto';
import { createHash } from 'node:crypto';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly storage: StorageService,
  ) {}

  async list(
    page = 1,
    limit = 20,
    filters?: { tag?: string; active?: boolean },
    roles?: string[],
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.tag) where.tags = { has: filters.tag };
    if (filters?.active !== undefined) where.isActive = filters.active;
    if (roles?.length) {
      where.OR = [
        { permissions: { none: {} } },
        { permissions: { some: { role: { name: { in: roles } } } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.file.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }

  async updateMetadata(id: string, dto: { tags?: string[]; isActive?: boolean; expiresAt?: string }) {
    return this.prisma.file.update({
      where: { id },
      data: {
        tags: dto.tags,
        isActive: dto.isActive,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async createFile(params: {
    file: Express.Multer.File;
    dto: CreateFileDto;
    createdById: string;
  }) {
    const driver = this.storage.getDriver();
    const safeOriginal = params.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeName = `${Date.now()}-${safeOriginal}`;
    const checksum = createHash('sha256').update(params.file.buffer).digest('hex');

    const saved = await driver.saveFile({ filename: safeName, buffer: params.file.buffer });

    return this.prisma.file.create({
      data: {
        filename: safeName,
        originalName: params.file.originalname,
        mimeType: params.file.mimetype,
        size: params.file.size,
        checksum,
        storagePath: saved.storagePath,
        version: 1,
        tags: params.dto.tags ?? [],
        isActive: params.dto.isActive ?? true,
        expiresAt: params.dto.expiresAt ? new Date(params.dto.expiresAt) : null,
        createdById: params.createdById,
        permissions: params.dto.roles?.length
          ? {
              create: params.dto.roles.map((role) => ({
                role: { connect: { name: role } },
              })),
            }
          : undefined,
      },
    });
  }

  async generateDownloadToken(fileId: string, userId: string, roles?: string[]) {
    if (roles?.length) {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
        include: { permissions: { include: { role: true } } },
      });
      if (!file) throw new NotFoundException('Archivo no encontrado');

      const allowedRoles = file.permissions.map((p) => p.role.name);
      const hasAccess =
        allowedRoles.length === 0 || roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) throw new NotFoundException('No autorizado');
    }
    const payload = { fileId, userId };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('FILE_TOKEN_SECRET') || 'file_secret',
      expiresIn: this.config.get<string>('FILE_TOKEN_EXPIRES_IN') || '10m',
    });
  }

  async verifyDownloadToken(token: string): Promise<{ fileId: string; userId: string }> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.config.get<string>('FILE_TOKEN_SECRET') || 'file_secret',
    });
    return { fileId: payload.fileId, userId: payload.userId };
  }

  async getFileForDownload(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('Archivo no encontrado');

    if (!file.isActive) throw new NotFoundException('Archivo inactivo');
    if (file.expiresAt && file.expiresAt < new Date()) {
      throw new NotFoundException('Archivo expirado');
    }

    return file;
  }

  async registerDownload(params: {
    fileId: string;
    userId: string;
    ip: string;
    userAgent: string;
  }) {
    await this.prisma.download.create({ data: params });
  }

  async listDownloads(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.download.findMany({
        skip,
        take: limit,
        orderBy: { downloadedAt: 'desc' },
      }),
      this.prisma.download.count(),
    ]);
    return { items, total, page, limit };
  }

  async deactivate(id: string) {
    return this.prisma.file.update({ where: { id }, data: { isActive: false } });
  }
}
