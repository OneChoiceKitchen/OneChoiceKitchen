import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { SecurePortal } from '../auth/decorators/secure-portal.decorator';
import { PortalCode } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalAccessGuard } from '../auth/guards/portal-access.guard';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PortalAccessGuard)
  @SecurePortal(PortalCode.PARTNER, true)
  create(@Req() req: any, @Body() createPromotionDto: CreatePromotionDto) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required for Partner operations');
    }
    return this.promotionsService.create(tenantId, createPromotionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PortalAccessGuard)
  @SecurePortal(PortalCode.PARTNER, true)
  findAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required for Partner operations');
    }
    return this.promotionsService.findAll(tenantId);
  }

  @Post('validate')
  validate(@Body() validateDto: ValidatePromotionDto) {
    return this.promotionsService.validate(validateDto);
  }
}
