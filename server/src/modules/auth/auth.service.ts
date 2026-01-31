import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';

export interface JwtUser {
  id: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private getRequiredConfig(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`${key} is not set`);
    }
    return value;
  }

  // Firma tokens access y refresh.
  async signTokens(user: JwtUser) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
    const accessExpires = (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m') as StringValue;
    const refreshExpires = (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as StringValue;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  // Valida credenciales y retorna datos mínimos para login.
  async validateUser(email: string, password: string): Promise<JwtUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const roles = user.roles.map((r) => r.role.name);
    return { id: user.id, email: user.email, roles };
  }

  // Verifica refresh token y firma nuevos tokens.
  async refreshTokens(refreshToken: string) {
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: refreshSecret,
    });

    return this.signTokens({
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });
  }
}
