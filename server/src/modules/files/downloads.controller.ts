import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('downloads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('root', 'admin')
export class DownloadsController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.filesService.listDownloads(Number(page), Number(limit));
  }
}
