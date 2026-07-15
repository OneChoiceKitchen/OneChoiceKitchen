import { Test, TestingModule } from '@nestjs/testing';
import { KitchenGateway } from './kitchen.gateway';
import { Server, Socket } from 'socket.io';

describe('KitchenGateway', () => {
  let gateway: KitchenGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KitchenGateway],
    }).compile();

    gateway = module.get<KitchenGateway>(KitchenGateway);
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinKitchen', () => {
    it('should join the correct room if tenantId is provided', () => {
      const mockClient = { join: jest.fn() } as unknown as Socket;
      const data = { tenantId: 'tenant-1' };

      const result = gateway.handleJoinKitchen(data, mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('kitchen_tenant-1');
      expect(result).toEqual({ event: 'joined', room: 'kitchen_tenant-1' });
    });

    it('should return error if tenantId is missing', () => {
      const mockClient = { join: jest.fn() } as unknown as Socket;
      const data = { tenantId: '' };

      const result = gateway.handleJoinKitchen(data, mockClient);

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(result).toEqual({ event: 'error', message: 'tenantId is required' });
    });
  });

  describe('broadcastOrderUpdate', () => {
    it('should emit orderUpdated event to tenant room', () => {
      const tenantId = 'tenant-1';
      const order = { id: 'order-1', status: 'PREPARING' };

      gateway.broadcastOrderUpdate(tenantId, order);

      expect(gateway.server.to).toHaveBeenCalledWith('kitchen_tenant-1');
      expect(gateway.server.emit).toHaveBeenCalledWith('orderUpdated', order);
    });
  });
});
