export interface StorageDriver {
  driverName(): string;
  saveFile(params: {
    filename: string;
    buffer: Buffer;
  }): Promise<{ storagePath: string }>;
  getFilePath(storagePath: string): string;
}
