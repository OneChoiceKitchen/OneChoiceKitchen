import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            }
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test_token'),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendOtpEmail: jest.fn().mockResolvedValue(true),
            sendOtpSms: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials (hardcoded mock)', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      
      const result = await service.login('customer@test.com', 'test123');
      expect(result).toEqual({ access_token: 'test_token' });
    });

    it('should throw UnauthorizedException if user not found and not mock', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      
      await expect(service.login('unknown@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });
  });
});
