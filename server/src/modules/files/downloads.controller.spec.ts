import { DownloadsController } from './downloads.controller';
import { FilesService } from './files.service';

describe('DownloadsController', () => {
  it('lista descargas', async () => {
    const filesService = {
      listDownloads: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    } as unknown as FilesService;

    const controller = new DownloadsController(filesService);
    const result = await controller.list(1, 20);

    expect(filesService.listDownloads).toHaveBeenCalledWith(1, 20);
    expect(result.total).toBe(0);
  });
});
