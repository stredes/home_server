import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Conecta al iniciar el módulo para asegurar DB lista.
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // Cierra conexión para evitar fugas en shutdown.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
