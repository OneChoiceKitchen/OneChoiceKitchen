import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsDateString()
  eventStartDate: string;

  @IsDateString()
  eventEndDate: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;
}
