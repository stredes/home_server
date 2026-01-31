import { Body, Controller, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Audit } from '../audit/audit.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login con JWT access + refresh en cookie httpOnly.
  @Post('login')
  @UseInterceptors(AuditInterceptor)
  @Audit({ action: 'LOGIN', entity: 'Auth' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokens = await this.authService.signTokens(user);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  // Refresh del access token usando cookie httpOnly.
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = refreshToken || req.cookies?.refresh_token;
    const tokens = await this.authService.refreshTokens(token);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  // Logout: limpia cookie.
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
