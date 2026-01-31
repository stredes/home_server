import { FilesController, MAX_UPLOAD_SIZE } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  it('lista archivos', async () => {
    const filesService = {
      list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    } as unknown as FilesService;

    const controller = new FilesController(filesService);

    const result = await controller.list(1, 20, undefined, undefined, { user: { roles: ['admin'] } });

    expect(filesService.list).toHaveBeenCalledWith(1, 20, {}, ['admin']);
    expect(result.total).toBe(0);
  });

  it('genera token de descarga', async () => {
    const filesService = {
      generateDownloadToken: jest.fn().mockResolvedValue('tok'),
    } as unknown as FilesService;

    const controller = new FilesController(filesService);
    const result = await controller.token('f1', { user: { id: 'u1', roles: ['admin'] } });

    expect(filesService.generateDownloadToken).toHaveBeenCalledWith('f1', 'u1', ['admin']);
    expect(result.token).toBe('tok');
  });

  it('obtiene detalle de archivo', async () => {
    const filesService = {
      getById: jest.fn().mockResolvedValue({ id: 'f1' }),
    } as unknown as FilesService;

    const controller = new FilesController(filesService);
    const result = await controller.getById('f1');

    expect(filesService.getById).toHaveBeenCalledWith('f1');
    expect(result.id).toBe('f1');
  });

  it('define limite de upload en 200MB', () => {
    expect(MAX_UPLOAD_SIZE).toBe(200 * 1024 * 1024);
  });

  it('actualiza metadata de archivo', async () => {
    const filesService = {
      updateMetadata: jest.fn().mockResolvedValue({ id: 'f1', isActive: false }),
    } as unknown as FilesService;

    const controller = new FilesController(filesService);
    const result = await controller.update('f1', { isActive: false });

    expect(filesService.updateMetadata).toHaveBeenCalledWith('f1', { isActive: false });
    expect(result.isActive).toBe(false);
  });

  it('desactiva archivo', async () => {
    const filesService = {
      deactivate: jest.fn().mockResolvedValue({ id: 'f1', isActive: false }),
    } as unknown as FilesService;

    const controller = new FilesController(filesService);
    const result = await controller.remove('f1');

    expect(filesService.deactivate).toHaveBeenCalledWith('f1');
    expect(result.isActive).toBe(false);
  });
});
