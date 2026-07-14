import { ApiProperty, ApiPropertyNullable } from '@nestjs/swagger';

export class BrandingColorsDto {
  @ApiProperty({ example: '#2563EB' })
  primary!: string;

  @ApiProperty({ example: '#DC2626' })
  secondary!: string;

  @ApiProperty({ example: '#f3f4f8' })
  background!: string;

  @ApiProperty({ example: '#0f172a' })
  text!: string;
}

export class BrandingResponseDto {
  @ApiProperty({ example: 'One Choice Kitchen' })
  siteName!: string;

  @ApiPropertyNullable({ type: String, example: '/branding/logo.svg' })
  logoUrl!: string | null;

  @ApiPropertyNullable({ type: String, example: '/branding/favicon.ico' })
  faviconUrl!: string | null;

  @ApiProperty({ type: BrandingColorsDto })
  colors!: BrandingColorsDto;
}
