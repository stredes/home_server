import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageDriver } from './local.storage';
import { StorageDriver } from './storage.interface';

@Injectable()
export class StorageService {
  private readonly driver: StorageDriver;

  constructor(private readonly config: ConfigService) {
    const driver = this.config.get<string>('STORAGE_DRIVER') || 'local';
    if (driver === 'local') {
      const basePath = this.config.get<string>('STORAGE_LOCAL_PATH') || '/data/files';
      this.driver = new LocalStorageDriver(basePath);
    } else {
      const basePath = this.config.get<string>('STORAGE_LOCAL_PATH') || '/data/files';
      this.driver = new LocalStorageDriver(basePath);
    }
  }

  getDriver(): StorageDriver {
    return this.driver;
  }
}
