import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('se instancia', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });
});
