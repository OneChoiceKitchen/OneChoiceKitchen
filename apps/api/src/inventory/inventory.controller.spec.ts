import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on the service', async () => {
    const data = { name: 'Item 1' };
    mockInventoryService.create.mockResolvedValue(data);
    const result = await controller.create(data);
    expect(result).toEqual(data);
    expect(service.create).toHaveBeenCalledWith(data);
  });

  it('should call findAll on the service', async () => {
    const data = [{ id: '1', name: 'Item 1' }];
    mockInventoryService.findAll.mockResolvedValue(data);
    const result = await controller.findAll();
    expect(result).toEqual(data);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call update on the service', async () => {
    const data = { name: 'Item 2' };
    mockInventoryService.update.mockResolvedValue({ id: '1', ...data });
    const result = await controller.update('1', data);
    expect(result.name).toEqual('Item 2');
    expect(service.update).toHaveBeenCalledWith('1', data);
  });

  it('should call remove on the service', async () => {
    const item = { id: '1', name: 'Item 1' };
    mockInventoryService.remove.mockResolvedValue(item);
    const result = await controller.remove('1');
    expect(result).toEqual(item);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
