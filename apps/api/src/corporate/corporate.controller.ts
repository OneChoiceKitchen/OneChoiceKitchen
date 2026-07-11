import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('corporate')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

  @Get()
  findAll() {
    return this.corporateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corporateService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() body: any) {
    return this.corporateService.createPlan(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.corporateService.updatePlan(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.corporateService.deletePlan(id);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.corporateService.subscribe(id, req.user.userId, body);
  }

  @Get(':id/subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARTNER')
  getSubscriptions(@Param('id') id: string) {
    return this.corporateService.getPlanSubscriptions(id);
  }
}
