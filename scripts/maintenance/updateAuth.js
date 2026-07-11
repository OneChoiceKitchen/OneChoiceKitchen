const fs = require('fs');

// 1. Update AuthModule
const authModulePath = 'api/src/app/auth/auth.module.ts';
let authModuleContent = `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
`;
fs.writeFileSync(authModulePath, authModuleContent);

// 2. Update AuthService
const authServicePath = 'api/src/app/auth/auth.service.ts';
let authServiceContent = `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      // Mock logic fallback for hardcoded frontend user until DB is seeded
      if (email === 'customer@test.com' && pass === 'test123') {
         return { access_token: this.jwtService.sign({ email, sub: 'mock-id' }) };
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = user.password 
        ? await bcrypt.compare(pass, user.password)
        : false;

    if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { 
        email: user.email, 
        sub: user.id 
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(name: string, email: string, pass: string): Promise<{ access_token: string }> {
    if (!name || !email || !pass) {
      throw new UnauthorizedException('Missing required fields');
    }

    const customerRole = await this.prisma.role.findUnique({ where: { name: 'CUSTOMER' } });

    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: customerRole ? customerRole.id : null,
      }
    });

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
`;
fs.writeFileSync(authServicePath, authServiceContent);

console.log('AuthModule and AuthService updated.');
