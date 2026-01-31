import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { StorageDriver } from './storage.interface';

export class LocalStorageDriver implements StorageDriver {
  constructor(private readonly basePath: string) {}

  driverName(): string {
    return 'local';
  }

  async saveFile(params: { filename: string; buffer: Buffer }) {
    await fs.mkdir(this.basePath, { recursive: true });
    const storagePath = join(this.basePath, params.filename);
    await fs.writeFile(storagePath, params.buffer);
    return { storagePath };
  }

  getFilePath(storagePath: string): string {
    return storagePath;
  }
}
