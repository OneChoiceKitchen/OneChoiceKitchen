import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from '@prisma/client';

export class CartItemDto {
  @IsString()
  menuItemId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  customizations?: string;
}

export class CreateOrderDto {
  @IsEnum(ItemType)
  serviceType: ItemType;

  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
