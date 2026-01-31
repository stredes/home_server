import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesController } from './files.controller';
import { DownloadsController } from './downloads.controller';
import { FilesService } from './files.service';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [ConfigModule, JwtModule.register({}), PrismaModule],
  controllers: [FilesController, DownloadsController],
  providers: [FilesService, StorageService],
})
export class FilesModule {}
