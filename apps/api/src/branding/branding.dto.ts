import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: String, nullable: true, example: '/branding/logo.svg' })
  logoUrl!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '/branding/favicon.ico' })
  faviconUrl!: string | null;

  @ApiProperty({ type: BrandingColorsDto })
  colors!: BrandingColorsDto;
}
