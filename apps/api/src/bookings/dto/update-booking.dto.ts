import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  eventStartDate?: string;

  @IsOptional()
  @IsDateString()
  eventEndDate?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  specialRequirements?: string;
}
