import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KitchenGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-kitchen')
  handleJoinKitchen(
    @MessageBody() data: { tenantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data && data.tenantId) {
      const room = `kitchen_${data.tenantId}`;
      client.join(room);
      return { event: 'joined', room };
    }
    return { event: 'error', message: 'tenantId is required' };
  }

  broadcastOrderUpdate(tenantId: string, order: any) {
    this.server.to(`kitchen_${tenantId}`).emit('orderUpdated', order);
  }
}
