import { JwtService } from '@nestjs/jwt';
import { FilesService } from './files.service';

const config = {
  get: (key: string) => {
    if (key === 'FILE_TOKEN_SECRET') return 'file_secret';
    if (key === 'FILE_TOKEN_EXPIRES_IN') return '10m';
    return undefined;
  },
} as any;

describe('FilesService', () => {
  it('genera token temporal de descarga', async () => {
    const prisma = { file: { findUnique: jest.fn(), update: jest.fn() } } as any;
    const jwt = new JwtService({});
    const storage = { driverName: () => 'local' } as any;

    const service = new FilesService(prisma, config, jwt, storage);
    const token = await service.generateDownloadToken('file-1', 'user-1');

    expect(token).toBeDefined();
  });

  it('verifica token temporal de descarga', async () => {
    const prisma = { file: { findUnique: jest.fn(), update: jest.fn() } } as any;
    const jwt = new JwtService({ secret: 'file_secret' });
    const storage = { driverName: () => 'local' } as any;

    const service = new FilesService(prisma, config, jwt, storage);
    const token = await service.generateDownloadToken('file-1', 'user-1');
    const payload = await service.verifyDownloadToken(token);

    expect(payload.fileId).toBe('file-1');
    expect(payload.userId).toBe('user-1');
  });

  it('lista descargas', async () => {
    const prisma = {
      file: { findUnique: jest.fn(), update: jest.fn() },
      download: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as any;
    const jwt = new JwtService({ secret: 'file_secret' });
    const storage = { driverName: () => 'local' } as any;

    const service = new FilesService(prisma, config, jwt, storage);
    const result = await service.listDownloads(1, 20);

    expect(prisma.download.findMany).toHaveBeenCalled();
    expect(result.total).toBe(0);
  });

  it('actualiza metadata', async () => {
    const prisma = {
      file: { update: jest.fn().mockResolvedValue({ id: 'f1', isActive: false }) },
      download: { findMany: jest.fn(), count: jest.fn() },
    } as any;
    const jwt = new JwtService({ secret: 'file_secret' });
    const storage = { driverName: () => 'local' } as any;

    const service = new FilesService(prisma, config, jwt, storage);
    const result = await service.updateMetadata('f1', { isActive: false });

    expect(prisma.file.update).toHaveBeenCalled();
    expect(result.isActive).toBe(false);
  });

  it('desactiva archivo', async () => {
    const prisma = {
      file: { update: jest.fn().mockResolvedValue({ id: 'f1', isActive: false }) },
      download: { findMany: jest.fn(), count: jest.fn() },
    } as any;
    const jwt = new JwtService({ secret: 'file_secret' });
    const storage = { driverName: () => 'local' } as any;

    const service = new FilesService(prisma, config, jwt, storage);
    const result = await service.deactivate('f1');

    expect(prisma.file.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { isActive: false },
    });
    expect(result.isActive).toBe(false);
  });
});
