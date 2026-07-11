import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SeoService } from '../services/seo.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('SEO & Branding')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get global system branding settings' })
  getSystemSettings() {
    return this.seoService.getSystemSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('settings')
  @ApiOperation({ summary: 'Update global system branding settings' })
  updateSystemSettings(@Body() data: any) {
    return this.seoService.updateSystemSettings(data);
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Get all SEO metadata pages' })
  getAllSeoMetadata() {
    return this.seoService.getAllSeoMetadata();
  }

  @Get('metadata/:pageName')
  @ApiOperation({ summary: 'Get SEO metadata for a specific page' })
  getSeoByPage(@Param('pageName') pageName: string) {
    return this.seoService.getSeoByPage(pageName);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('metadata/:pageName')
  @ApiOperation({ summary: 'Update SEO metadata for a specific page' })
  updateSeoMetadata(@Param('pageName') pageName: string, @Body() data: any) {
    return this.seoService.updateSeoMetadata(pageName, data);
  }
}
