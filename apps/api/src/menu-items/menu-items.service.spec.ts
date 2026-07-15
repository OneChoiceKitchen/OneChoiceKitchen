import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from './menu-items.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MenuItemsService', () => {
  let service: MenuItemsService;
  let prisma: PrismaService;
  
  const mockPrisma = {
    menuItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    },
    menuCategory: {
      findFirst: jest.fn()
    }
  };

  const mockTenantScope = {
    getTenantId: jest.fn().mockReturnValue('tenant-1'),
    scopeWhere: jest.fn().mockImplementation((where) => ({ ...where, tenantId: 'tenant-1' }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TenantScopeService, useValue: mockTenantScope }
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should validate category belongs to tenant on create', async () => {
    mockPrisma.menuCategory.findFirst.mockResolvedValueOnce(null); // Category not found or wrong tenant
    
    await expect(service.create({ name: 'Test', categoryId: 'invalid' })).rejects.toThrow(BadRequestException);
  });

  it('should automatically set sortOrder when creating', async () => {
    mockPrisma.menuCategory.findFirst.mockResolvedValueOnce({ id: 'cat-1' });
    mockPrisma.menuItem.findFirst.mockResolvedValueOnce({ sortOrder: 5 });
    mockPrisma.menuItem.create.mockResolvedValueOnce({ id: '1', sortOrder: 6 });
    
    await service.create({ name: 'Test', categoryId: 'cat-1' });
    expect(mockPrisma.menuItem.create).toHaveBeenCalledWith({
      data: { name: 'Test', categoryId: 'cat-1', sortOrder: 6, tenantId: 'tenant-1' }
    });
  });

  it('should scope queries to tenant and active items', async () => {
    await service.findAll();
    expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith({
      where: { isDeleted: false, tenantId: 'tenant-1' },
      orderBy: { sortOrder: 'asc' }
    });
  });

  it('should soft delete item', async () => {
    mockPrisma.menuItem.findFirst.mockResolvedValueOnce({ id: '1' });
    mockPrisma.menuItem.update.mockResolvedValueOnce({ id: '1', isDeleted: true });
    
    await service.remove('1');
    expect(mockPrisma.menuItem.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: expect.objectContaining({ isDeleted: true })
    });
  });
});
