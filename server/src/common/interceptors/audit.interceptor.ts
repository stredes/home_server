import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AUDIT_KEY, AuditMeta } from '../../modules/audit/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.getAllAndOverride<AuditMeta>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const actorId = request.user?.id ?? 'anonymous';
    const ip = request.ip ?? 'unknown';
    const userAgent = request.headers?.['user-agent'] ?? 'unknown';

    return next.handle().pipe(
      tap(async () => {
        await this.prisma.auditLog.create({
          data: {
            actorUserId: actorId,
            action: meta.action,
            entity: meta.entity,
            entityId: request.params?.id ?? null,
            metaJson: { userAgent },
            ip,
          },
        });
      }),
    );
  }
}
