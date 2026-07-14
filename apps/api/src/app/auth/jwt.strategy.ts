import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    let user: Awaited<ReturnType<typeof this.prisma.user.findUnique>>;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (!this.isMissingUserTableError(error)) throw error;
      user = null;
    }

    if (!user) {
      if (payload.sub === 'mock-id') {
        return { userId: 'mock-id', email: payload.email, role: 'CUSTOMER' };
      }
      if (payload.sub === 'mock-admin-id') {
        return {
          userId: 'mock-admin-id',
          email: payload.email,
          role: 'SUPER_ADMIN',
        };
      }
      if (payload.sub === 'mock-partner-id') {
        return {
          userId: 'mock-partner-id',
          email: payload.email,
          role: 'PARTNER',
        };
      }
      if (payload.sub === 'mock-rider-id') {
        return { userId: 'mock-rider-id', email: payload.email, role: 'RIDER' };
      }
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const permissions =
      user.role?.permissions.map((p: any) => p.permission.name) || [];

    return {
      userId: payload.sub,
      email: payload.email,
      restaurantId: user.restaurantId,
      role: user.role?.name || 'CUSTOMER',
      permissions,
    };
  }

  private isMissingUserTableError(error: unknown): boolean {
    if (process.env.NODE_ENV === 'production') return false;

    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'cause' in error
          ? JSON.stringify((error as { cause?: unknown }).cause)
          : String(error);
    return /no such table:\s*main\.cat_customers|no such table:\s*cat_customers/i.test(
      message,
    );
  }
}
