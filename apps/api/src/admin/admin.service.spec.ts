import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  tenant: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  approvalDecision: {
    findMany: jest.fn(),
    count: jest.fn(),
  }
};

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenants', () => {
    it('should return paginated tenants', async () => {
      const mockTenants = [{ id: '1', name: 'Tenant 1' }];
      mockPrismaService.tenant.findMany.mockResolvedValue(mockTenants);
      mockPrismaService.tenant.count.mockResolvedValue(1);

      const result = await service.getTenants(0, 10);
      expect(result.data).toEqual(mockTenants);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updateTenantStatus', () => {
    it('should update tenant status', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.tenant.update.mockResolvedValue({ id: '1', status: 'ACTIVE' });

      const result = await service.updateTenantStatus('1', 'ACTIVE');
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      await expect(service.updateTenantStatus('invalid', 'ACTIVE')).rejects.toThrow('Tenant not found');
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [{ id: '1', action: 'APPROVE' }];
      mockPrismaService.approvalDecision.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.approvalDecision.count.mockResolvedValue(1);

      const result = await service.getAuditLogs(0, 10);
      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(1);
    });
  });
});
