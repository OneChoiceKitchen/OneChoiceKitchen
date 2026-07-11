import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an inventory item', async () => {
    const data = { name: 'Item 1' };
    mockPrismaService.inventoryItem.create.mockResolvedValue(data);
    const result = await service.create(data);
    expect(result).toEqual(data);
    expect(prisma.inventoryItem.create).toHaveBeenCalledWith({ data });
  });

  it('should return all inventory items', async () => {
    const data = [{ id: '1', name: 'Item 1' }];
    mockPrismaService.inventoryItem.findMany.mockResolvedValue(data);
    const result = await service.findAll();
    expect(result).toEqual(data);
    expect(prisma.inventoryItem.findMany).toHaveBeenCalled();
  });

  it('should update an inventory item', async () => {
    const item = { id: '1', name: 'Item 1' };
    const data = { name: 'Item 2' };
    mockPrismaService.inventoryItem.findUnique.mockResolvedValue(item);
    mockPrismaService.inventoryItem.update.mockResolvedValue({ ...item, ...data });
    const result = await service.update('1', data);
    expect(result.name).toEqual('Item 2');
    expect(prisma.inventoryItem.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
  });

  it('should throw NotFoundException if updating non-existent item', async () => {
    mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);
    await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
  });

  it('should delete an inventory item', async () => {
    const item = { id: '1', name: 'Item 1' };
    mockPrismaService.inventoryItem.delete.mockResolvedValue(item);
    const result = await service.remove('1');
    expect(result).toEqual(item);
    expect(prisma.inventoryItem.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
