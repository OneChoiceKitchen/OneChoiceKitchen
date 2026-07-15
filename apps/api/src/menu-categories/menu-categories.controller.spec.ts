import { Test, TestingModule } from '@nestjs/testing';
import { MenuCategoriesController } from './menu-categories.controller';
import { MenuCategoriesService } from './menu-categories.service';

import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { UserContextGuard } from '../app/auth/user-context.guard';
import { PortalGuard } from '../app/auth/portal.guard';
import { TenantGuard } from '../app/auth/tenant.guard';
import { EntitlementGuard } from '../feature-access/entitlement.guard';

describe('MenuCategoriesController', () => {
  let controller: MenuCategoriesController;
  
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
    findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1', name: 'Test' })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuCategoriesController],
      providers: [
        {
          provide: MenuCategoriesService,
          useValue: mockService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(UserContextGuard).useValue({ canActivate: () => true })
    .overrideGuard(PortalGuard).useValue({ canActivate: () => true })
    .overrideGuard(TenantGuard).useValue({ canActivate: () => true })
    .overrideGuard(EntitlementGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<MenuCategoriesController>(MenuCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
