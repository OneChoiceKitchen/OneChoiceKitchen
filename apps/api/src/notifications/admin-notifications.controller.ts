import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AdminNotificationsService, UserContext } from './admin-notifications.service';

@Controller('admin-notifications')
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  @Get('pending')
  async getPendingNotifications(@Req() req: any) {
    // In a real scenario, this comes from a JWT Auth Guard.
    // Since the frontend passes these in localStorage headers or token claims, we extract them.
    // For OneChoiceKitchen backend, if there is a JwtAuthGuard, req.user will have these details.
    
    let userId = req.user?.id || req.headers['x-admin-id'] || 'system';
    let role = req.user?.role || req.headers['x-admin-role'] || 'ADMIN';
    let restaurantId = req.user?.restaurantId || req.headers['x-admin-restaurant-id'] || null;
    
    // Parse permissions if available
    let permissions = [];
    if (req.user?.permissions) {
      permissions = req.user.permissions;
    } else if (req.headers['x-admin-permissions']) {
      try {
        permissions = JSON.parse(req.headers['x-admin-permissions'] as string);
      } catch (e) {
        // ignore parsing error
      }
    }

    if (role === 'CUSTOMER') {
      throw new UnauthorizedException('Admin access required');
    }

    const context: UserContext = {
      userId,
      role,
      restaurantId,
      permissions
    };

    return this.adminNotificationsService.getPendingNotifications(context);
  }

  @Get('seed')
  async seedDummyData() {
    return this.adminNotificationsService.seedDummyData();
  }
}
