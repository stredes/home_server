import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('root', 'admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.auditService.list(Number(page), Number(limit));
  }
}
