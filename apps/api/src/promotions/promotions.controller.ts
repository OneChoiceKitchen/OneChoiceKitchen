import { Controller, Get, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { PortalCode } from '@prisma/client';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @SecurePortal(PortalCode.PARTNER, true)
  create(@Req() req: any, @Body() createPromotionDto: CreatePromotionDto) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required for Partner operations');
    }
    return this.promotionsService.create(tenantId, createPromotionDto);
  }

  @Get()
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
