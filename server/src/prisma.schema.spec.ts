import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Prisma schema', () => {
  it('define los modelos requeridos', () => {
    const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('model User');
    expect(schema).toContain('model Role');
    expect(schema).toContain('model UserRole');
    expect(schema).toContain('model File');
    expect(schema).toContain('model FilePermission');
    expect(schema).toContain('model Download');
    expect(schema).toContain('model AuditLog');
  });
});
