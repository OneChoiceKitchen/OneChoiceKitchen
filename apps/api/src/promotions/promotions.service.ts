import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createPromotionDto: CreatePromotionDto) {
    // Check if code exists for tenant
    const existing = await this.prisma.promotion.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: createPromotionDto.code.toUpperCase()
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Promotion code already exists');
    }

    return this.prisma.promotion.create({
      data: {
        ...createPromotionDto,
        code: createPromotionDto.code.toUpperCase(),
        tenantId,
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.promotion.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async validate(validateDto: ValidatePromotionDto) {
    const { code, tenantId, cartTotal } = validateDto;
    
    const promotion = await this.prisma.promotion.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: code.toUpperCase()
        }
      }
    });

    if (!promotion) {
      throw new BadRequestException('Invalid promo code');
    }

    if (!promotion.isActive) {
      throw new BadRequestException('Promo code is no longer active');
    }

    const now = new Date();
    if (now < promotion.validFrom || now > promotion.validUntil) {
      throw new BadRequestException('Promo code is expired or not yet valid');
    }

    if (promotion.minOrderValue && cartTotal < promotion.minOrderValue) {
      throw new BadRequestException(`Minimum order value of ${promotion.minOrderValue} not met`);
    }

    let discountAmount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * promotion.discountValue) / 100;
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    // Ensure discount isn't more than cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return {
      valid: true,
      discountAmount,
      promotion
    };
  }
}
