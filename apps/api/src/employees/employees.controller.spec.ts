import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployeesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignShift: jest.fn(),
    removeShift: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockEmployeesService },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on the service', async () => {
    const data = { name: 'John Doe' };
    mockEmployeesService.create.mockResolvedValue(data);
    const result = await controller.create(data);
    expect(result).toEqual(data);
    expect(service.create).toHaveBeenCalledWith(data);
  });

  it('should call findAll on the service', async () => {
    const data = [{ id: '1', name: 'John Doe' }];
    mockEmployeesService.findAll.mockResolvedValue(data);
    const result = await controller.findAll();
    expect(result).toEqual(data);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call update on the service', async () => {
    const data = { name: 'John Smith' };
    mockEmployeesService.update.mockResolvedValue({ id: '1', ...data });
    const result = await controller.update('1', data);
    expect(result.name).toEqual('John Smith');
    expect(service.update).toHaveBeenCalledWith('1', data);
  });

  it('should call remove on the service', async () => {
    const item = { id: '1', name: 'John Doe' };
    mockEmployeesService.remove.mockResolvedValue(item);
    const result = await controller.remove('1');
    expect(result).toEqual(item);
    expect(service.remove).toHaveBeenCalledWith('1');
  });

  it('should call assignShift on the service', async () => {
    const shiftData = { start: '10:00' };
    mockEmployeesService.assignShift.mockResolvedValue({ id: 's1', employeeId: '1', ...shiftData });
    const result = await controller.assignShift('1', shiftData);
    expect(result.id).toEqual('s1');
    expect(service.assignShift).toHaveBeenCalledWith('1', shiftData);
  });

  it('should call removeShift on the service', async () => {
    mockEmployeesService.removeShift.mockResolvedValue({ id: 's1' });
    const result = await controller.removeShift('s1');
    expect(result.id).toEqual('s1');
    expect(service.removeShift).toHaveBeenCalledWith('s1');
  });
});
