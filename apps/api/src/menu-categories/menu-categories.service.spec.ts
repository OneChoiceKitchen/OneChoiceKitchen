import { Test, TestingModule } from '@nestjs/testing';
import { MenuCategoriesService } from './menu-categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { NotFoundException } from '@nestjs/common';

describe('MenuCategoriesService', () => {
  let service: MenuCategoriesService;
  let prisma: PrismaService;
  
  const mockPrisma = {
    menuCategory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  };

  const mockTenantScope = {
    getTenantId: jest.fn().mockReturnValue('tenant-1'),
    scopeWhere: jest.fn().mockImplementation((where) => ({ ...where, tenantId: 'tenant-1' }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TenantScopeService, useValue: mockTenantScope }
      ],
    }).compile();

    service = module.get<MenuCategoriesService>(MenuCategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should automatically set sortOrder when creating', async () => {
    mockPrisma.menuCategory.findFirst.mockResolvedValueOnce({ sortOrder: 5 });
    mockPrisma.menuCategory.create.mockResolvedValueOnce({ id: '1', sortOrder: 6 });
    
    await service.create({ name: 'Test' });
    expect(mockPrisma.menuCategory.create).toHaveBeenCalledWith({
      data: { name: 'Test', sortOrder: 6, tenantId: 'tenant-1' }
    });
  });

  it('should scope queries to tenant', async () => {
    await service.findAll();
    expect(mockPrisma.menuCategory.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      orderBy: { sortOrder: 'asc' }
    });
  });

  it('should throw NotFoundException if category not found or in different tenant', async () => {
    mockPrisma.menuCategory.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
