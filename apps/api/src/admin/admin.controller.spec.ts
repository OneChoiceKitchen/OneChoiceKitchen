import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

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
    }).compile();

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
