import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { UserContextGuard } from '../app/auth/user-context.guard';
import { PortalGuard } from '../app/auth/portal.guard';
import { TenantGuard } from '../app/auth/tenant.guard';
import { EntitlementGuard } from '../feature-access/entitlement.guard';

describe('InventoryController', () => {
  let controller: InventoryController;
  
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
    findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    mapToMenu: jest.fn().mockResolvedValue({ id: 'map-1' })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
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

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should map to menu', async () => {
    const result = await controller.mapToMenu({ menuItemId: '1', inventoryItemId: '2', quantityRequired: 5 });
    expect(result).toEqual({ id: 'map-1' });
    expect(mockService.mapToMenu).toHaveBeenCalledWith('1', '2', 5);
  });
});
