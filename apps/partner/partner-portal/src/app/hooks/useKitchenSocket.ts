import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useKitchenSocket(tenantId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    // Use current origin for socket connection, assuming backend is on same host or proxied
    const socketInstance = io('/', {
      path: '/socket.io', // default path
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join-kitchen', { tenantId }, (response: any) => {
        if (response?.event === 'joined') {
          console.log(`Joined kitchen room: ${response.room}`);
        } else {
          console.error('Failed to join kitchen room:', response);
        }
      });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [tenantId]);

  return { socket, isConnected };
}
