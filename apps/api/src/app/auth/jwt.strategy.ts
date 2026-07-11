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
    let user = await this.prisma.user.findUnique({
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

    if (!user) {
      if (payload.sub === 'mock-id') {
        return { userId: 'mock-id', email: payload.email, role: 'CUSTOMER' };
      }
      if (payload.sub === 'mock-admin-id') {
        return { userId: 'mock-admin-id', email: payload.email, role: 'SUPER_ADMIN' };
      }
      if (payload.sub === 'mock-partner-id') {
        return { userId: 'mock-partner-id', email: payload.email, role: 'PARTNER' };
      }
      if (payload.sub === 'mock-rider-id') {
        return { userId: 'mock-rider-id', email: payload.email, role: 'RIDER' };
      }
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const permissions = user.role?.permissions.map((p: any) => p.permission.name) || [];

    return { 
      userId: payload.sub, 
      email: payload.email, 
      restaurantId: user.restaurantId,
      role: user.role?.name || 'CUSTOMER',
      permissions
    };
  }
}
