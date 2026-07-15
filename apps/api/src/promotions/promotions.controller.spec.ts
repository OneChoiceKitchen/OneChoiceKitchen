import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { UnauthorizedException } from '@nestjs/common';

describe('PromotionsController', () => {
  let controller: PromotionsController;
  let service: PromotionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [
        {
          provide: PromotionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PromotionsController>(PromotionsController);
    service = module.get<PromotionsService>(PromotionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should throw UnauthorizedException if no tenantId', () => {
      expect(() =>
        controller.create({ user: {} } as any, {} as any),
      ).toThrow(UnauthorizedException);
    });

    it('should call service.create', () => {
      const dto: any = { code: 'TEST' };
      controller.create({ user: { tenantId: 'tenant1' } } as any, dto);
      expect(service.create).toHaveBeenCalledWith('tenant1', dto);
    });
  });

  describe('validate', () => {
    it('should call service.validate', () => {
      const dto: any = { code: 'TEST', cartTotal: 500, tenantId: 'tenant1' };
      controller.validate(dto);
      expect(service.validate).toHaveBeenCalledWith(dto);
    });
  });
});
