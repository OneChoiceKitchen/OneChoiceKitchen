import { IsString, IsNumber } from 'class-validator';

export class ValidatePromotionDto {
  @IsString()
  code: string;

  @IsString()
  tenantId: string;

  @IsNumber()
  cartTotal: number;
}
