import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    employee: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shift: {
      create: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    const data = { name: 'John Doe', email: 'john@example.com' };
    mockPrismaService.employee.create.mockResolvedValue(data);
    const result = await service.create(data);
    expect(result).toEqual(data);
    expect(prisma.employee.create).toHaveBeenCalledWith({ data });
  });

  it('should return all employees with shifts', async () => {
    const data = [{ id: '1', name: 'John', shifts: [] }];
    mockPrismaService.employee.findMany.mockResolvedValue(data);
    const result = await service.findAll();
    expect(result).toEqual(data);
    expect(prisma.employee.findMany).toHaveBeenCalledWith({ include: { shifts: true } });
  });

  it('should update an employee', async () => {
    const item = { id: '1', name: 'John' };
    const data = { name: 'Johnny' };
    mockPrismaService.employee.findUnique.mockResolvedValue(item);
    mockPrismaService.employee.update.mockResolvedValue({ ...item, ...data });
    const result = await service.update('1', data);
    expect(result.name).toEqual('Johnny');
    expect(prisma.employee.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
  });

  it('should throw NotFoundException if updating non-existent employee', async () => {
    mockPrismaService.employee.findUnique.mockResolvedValue(null);
    await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
  });

  it('should delete an employee', async () => {
    const item = { id: '1', name: 'John' };
    mockPrismaService.employee.delete.mockResolvedValue(item);
    const result = await service.remove('1');
    expect(result).toEqual(item);
    expect(prisma.employee.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should assign a shift', async () => {
    const shiftData = { start: '10:00', end: '14:00' };
    mockPrismaService.shift.create.mockResolvedValue({ id: 's1', employeeId: '1', ...shiftData });
    const result = await service.assignShift('1', shiftData);
    expect(result.employeeId).toEqual('1');
    expect(prisma.shift.create).toHaveBeenCalledWith({ data: { ...shiftData, employeeId: '1' } });
  });

  it('should remove a shift', async () => {
    mockPrismaService.shift.delete.mockResolvedValue({ id: 's1' });
    const result = await service.removeShift('s1');
    expect(result.id).toEqual('s1');
    expect(prisma.shift.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
  });
});
