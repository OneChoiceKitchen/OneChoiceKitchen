import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsEnum(['PERCENTAGE', 'FLAT'])
  discountType: 'PERCENTAGE' | 'FLAT';

  @IsNumber()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
