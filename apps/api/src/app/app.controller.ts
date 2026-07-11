import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('stats')
  getStats() {
    return {
      revenue: '124,500',
      restaurants: '1,245',
      riders: '8,430',
      aiInsights: '45.2K'
    };
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api'
    };
  }
}
