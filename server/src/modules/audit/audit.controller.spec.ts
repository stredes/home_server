import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  it('lista logs', async () => {
    const auditService = {
      list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    } as unknown as AuditService;

    const controller = new AuditController(auditService);
    const result = await controller.list(1, 20);

    expect(auditService.list).toHaveBeenCalledWith(1, 20);
    expect(result.total).toBe(0);
  });
});
