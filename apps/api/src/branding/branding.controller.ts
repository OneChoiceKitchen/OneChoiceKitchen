import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BrandingResponseDto } from './branding.dto';
import { BrandingService } from './branding.service';

@ApiTags('Branding')
@Controller('v1/branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @Header('Cache-Control', 'no-cache, max-age=0, must-revalidate')
  @ApiOperation({ summary: 'Get public global portal branding' })
  @ApiOkResponse({ type: BrandingResponseDto })
  getBranding(): Promise<BrandingResponseDto> {
    return this.brandingService.getBranding();
  }
}
