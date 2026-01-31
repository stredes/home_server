import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Audit } from '../audit/audit.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

export const MAX_UPLOAD_SIZE = 200 * 1024 * 1024;

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('tag') tag?: string,
    @Query('active') active?: string,
    @Req() req?: any,
  ) {
    const activeBool = active === undefined ? undefined : active === 'true';
    const filters = { ...(tag ? { tag } : {}), ...(active !== undefined ? { active: activeBool } : {}) };
    return this.filesService.list(Number(page), Number(limit), filters, req?.user?.roles);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.filesService.getById(id);
  }

  @Patch(':id')
  @Roles('root', 'admin', 'operador')
  @UseInterceptors(AuditInterceptor)
  @Audit({ action: 'UPDATE_FILE', entity: 'File' })
  async update(@Param('id') id: string, @Body() dto: UpdateFileDto) {
    return this.filesService.updateMetadata(id, dto);
  }

  @Post()
  @Roles('root', 'admin', 'operador')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'application/zip', 'text/plain'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
    AuditInterceptor,
  )
  @Audit({ action: 'UPLOAD_FILE', entity: 'File' })
  async upload(@Body() dto: CreateFileDto, @Req() req: any) {
    const file = req.file;
    if (!file) throw new BadRequestException('Archivo requerido');
    return this.filesService.createFile({
      file,
      dto,
      createdById: req.user.id,
    });
  }

  @Post(':id/token')
  async token(@Param('id') id: string, @Req() req: any) {
    return { token: await this.filesService.generateDownloadToken(id, req.user.id, req.user.roles) };
  }

  @Delete(':id')
  @Roles('root', 'admin')
  @UseInterceptors(AuditInterceptor)
  @Audit({ action: 'DEACTIVATE_FILE', entity: 'File' })
  async remove(@Param('id') id: string) {
    return this.filesService.deactivate(id);
  }

  @Public()
  @Get('download/:token')
  async download(@Param('token') token: string, @Req() req: any, @Res() res: Response) {
    const payload = await this.filesService.verifyDownloadToken(token);
    const file = await this.filesService.getFileForDownload(payload.fileId);
    await this.filesService.registerDownload({
      fileId: file.id,
      userId: payload.userId,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    return res.sendFile(file.storagePath);
  }
}
