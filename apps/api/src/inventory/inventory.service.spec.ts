import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;
  
  const mockPrisma = {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    menuItem: {
      findFirst: jest.fn()
    },
    menuInventoryMapping: {
      create: jest.fn()
    }
  };

  const mockTenantScope = {
    getTenantId: jest.fn().mockReturnValue('tenant-1'),
    scopeWhere: jest.fn().mockImplementation((where) => ({ ...where, tenantId: 'tenant-1' }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TenantScopeService, useValue: mockTenantScope }
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('mapToMenu', () => {
    it('should validate menuItem belongs to tenant', async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValueOnce(null); // Menu item not found
      
      await expect(service.mapToMenu('invalid', 'inv-1', 1)).rejects.toThrow(BadRequestException);
    });

    it('should validate inventoryItem belongs to tenant', async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValueOnce({ id: 'menu-1' });
      mockPrisma.inventoryItem.findFirst.mockResolvedValueOnce(null); // Inventory item not found
      
      await expect(service.mapToMenu('menu-1', 'invalid', 1)).rejects.toThrow(NotFoundException);
    });

    it('should create mapping if both belong to tenant', async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValueOnce({ id: 'menu-1' });
      mockPrisma.inventoryItem.findFirst.mockResolvedValueOnce({ id: 'inv-1' });
      mockPrisma.menuInventoryMapping.create.mockResolvedValueOnce({ id: 'map-1' });
      
      await service.mapToMenu('menu-1', 'inv-1', 5);
      
      expect(mockPrisma.menuInventoryMapping.create).toHaveBeenCalledWith({
        data: {
          menuItemId: 'menu-1',
          inventoryItemId: 'inv-1',
          quantityRequired: 5
        }
      });
    });
  });
});
