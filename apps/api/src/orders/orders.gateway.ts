import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server!: Server;

  notifyOrderStatusChange(orderId: string, status: string, additionalData?: any) {
    this.server.emit('orderStatusChanged', { orderId, status, ...additionalData });
  }

  notifyNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }
}
