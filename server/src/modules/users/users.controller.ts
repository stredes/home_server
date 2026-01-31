import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SetRolesDto } from './dto/set-roles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../audit/audit.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('root', 'admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lista usuarios con paginación simple.
  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.list(Number(page), Number(limit));
  }

  // Crea usuario (solo admin/root).
  @Post()
  @UseInterceptors(AuditInterceptor)
  @Audit({ action: 'CREATE_USER', entity: 'User' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post(':id/roles')
  @UseInterceptors(AuditInterceptor)
  @Audit({ action: 'SET_ROLES', entity: 'User' })
  async setRoles(@Param('id') id: string, @Body() dto: SetRolesDto) {
    return this.usersService.setRoles(id, dto.roles);
  }
}
