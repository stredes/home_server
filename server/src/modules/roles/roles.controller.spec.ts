import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  it('lista roles', async () => {
    const rolesService = {
      list: jest.fn().mockResolvedValue([{ name: 'admin' }]),
    } as unknown as RolesService;

    const controller = new RolesController(rolesService);
    const result = await controller.list();

    expect(rolesService.list).toHaveBeenCalled();
    expect(result[0].name).toBe('admin');
  });

  it('crea rol', async () => {
    const rolesService = {
      create: jest.fn().mockResolvedValue({ name: 'operador' }),
    } as unknown as RolesService;

    const controller = new RolesController(rolesService);
    const result = await controller.create({ name: 'operador' });

    expect(rolesService.create).toHaveBeenCalledWith('operador');
    expect(result.name).toBe('operador');
  });
});
