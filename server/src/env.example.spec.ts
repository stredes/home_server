import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Env example', () => {
  it('incluye variables requeridas', () => {
    const envPath = join(__dirname, '..', '.env.example');
    const env = readFileSync(envPath, 'utf8');

    expect(env).toContain('DATABASE_URL=');
    expect(env).toContain('JWT_ACCESS_SECRET=');
    expect(env).toContain('JWT_REFRESH_SECRET=');
    expect(env).toContain('STORAGE_DRIVER=');
  });
});
