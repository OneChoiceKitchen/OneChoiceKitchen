import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { UserContextGuard } from '../app/auth/user-context.guard';
import { PortalGuard } from '../app/auth/portal.guard';
import { TenantGuard } from '../app/auth/tenant.guard';
import { EntitlementGuard } from '../feature-access/entitlement.guard';

const mockAdminService = {
  getTenants: jest.fn(),
  updateTenantStatus: jest.fn(),
  getAuditLogs: jest.fn(),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(UserContextGuard).useValue({ canActivate: () => true })
    .overrideGuard(PortalGuard).useValue({ canActivate: () => true })
    .overrideGuard(TenantGuard).useValue({ canActivate: () => true })
    .overrideGuard(EntitlementGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenants', () => {
    it('should call adminService.getTenants', async () => {
      mockAdminService.getTenants.mockResolvedValue({ data: [] });
      await controller.getTenants('0', '10');
      expect(mockAdminService.getTenants).toHaveBeenCalledWith(0, 10);
    });
  });

  describe('updateTenantStatus', () => {
    it('should call adminService.updateTenantStatus', async () => {
      mockAdminService.updateTenantStatus.mockResolvedValue({ id: '1', status: 'ACTIVE' });
      await controller.updateTenantStatus('1', 'ACTIVE');
      expect(mockAdminService.updateTenantStatus).toHaveBeenCalledWith('1', 'ACTIVE');
    });
  });

  describe('getAuditLogs', () => {
    it('should call adminService.getAuditLogs', async () => {
      mockAdminService.getAuditLogs.mockResolvedValue({ data: [] });
      await controller.getAuditLogs('0', '10');
      expect(mockAdminService.getAuditLogs).toHaveBeenCalledWith(0, 10);
    });
  });
});
