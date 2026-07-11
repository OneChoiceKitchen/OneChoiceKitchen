import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EventPackagesService } from './event-packages.service';

@Controller('event-packages')
export class EventPackagesController {
  constructor(private readonly eventPackagesService: EventPackagesService) {}

  @Post('food')
  createFoodPackage(@Body() data: any) {
    return this.eventPackagesService.createFoodPackage(data);
  }

  @Get('food')
  findAllFoodPackages(@Query('restaurantId') restaurantId: string) {
    return this.eventPackagesService.findAllFoodPackages(restaurantId);
  }

  @Post('addon')
  createAddonPackage(@Body() data: any) {
    return this.eventPackagesService.createAddonPackage(data);
  }

  @Get('addon')
  findAllAddonPackages(@Query('restaurantId') restaurantId: string) {
    return this.eventPackagesService.findAllAddonPackages(restaurantId);
  }
}
