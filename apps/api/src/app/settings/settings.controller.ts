import { Controller, Get, Post, Body, UseGuards, Param, Patch, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions.constants';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('ADMIN')
@Permissions(PERMISSIONS.MANAGE_SETTINGS)
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get('storage')
  async getStorageConfigs() {
    return this.prisma.storageConfig.findMany();
  }

  @Post('storage')
  async createStorageConfig(@Body() data: any) {
    if (data.isActive) {
      await this.prisma.storageConfig.updateMany({ data: { isActive: false } });
    }
    return this.prisma.storageConfig.create({ data });
  }

  @Patch('storage/:id')
  async updateStorageConfig(@Param('id') id: string, @Body() data: any) {
    if (data.isActive) {
      await this.prisma.storageConfig.updateMany({ data: { isActive: false } });
    }
    return this.prisma.storageConfig.update({ where: { id }, data });
  }

  @Get('auth')
  async getAuthConfigs() {
    return this.prisma.authConfig.findMany();
  }

  @Post('auth')
  async createAuthConfig(@Body() data: any) {
    return this.prisma.authConfig.create({ data });
  }

  @Patch('auth/:id')
  async updateAuthConfig(@Param('id') id: string, @Body() data: any) {
    return this.prisma.authConfig.update({ where: { id }, data });
  }

  @Get('ai')
  async getAiConfigs() {
    return this.prisma.aiConfig.findMany();
  }

  @Post('ai')
  async createAiConfig(@Body() data: any) {
    if (data.isActive) {
      await this.prisma.aiConfig.updateMany({ data: { isActive: false } });
    }
    return this.prisma.aiConfig.create({ data });
  }

  @Patch('ai/:id')
  async updateAiConfig(@Param('id') id: string, @Body() data: any) {
    if (data.isActive) {
      await this.prisma.aiConfig.updateMany({ data: { isActive: false } });
    }
    return this.prisma.aiConfig.update({ where: { id }, data });
  }

  @Post('ai/test')
  async testAiConnection(@Body() data: { apiKey: string, modelName: string }) {
    if (!data.apiKey || !data.modelName) {
      throw new BadRequestException('API Key and Model Name are required to test connection');
    }
    
    try {
      const prompt = "Reply with 'OK'";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${data.modelName}:generateContent?key=${data.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const result = await response.json() as any;
      
      if (!response.ok) {
        throw new BadRequestException(result.error?.message || 'Failed to connect to Gemini API');
      }

      return { success: true, message: 'Connection successful!' };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to connect to Gemini API');
    }
  }

  @Post('ai/models')
  async fetchAiModels(@Body() data: { apiKey: string }) {
    if (!data.apiKey) {
      throw new BadRequestException('API Key is required to fetch models');
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${data.apiKey}`);
      const result = await response.json() as any;
      
      if (!response.ok) {
        throw new BadRequestException(result.error?.message || 'Failed to fetch models from Gemini API');
      }

      // Filter for models that support generateContent
      const validModels = (result.models || [])
        .filter((model: any) => 
          model.supportedGenerationMethods?.includes('generateContent') &&
          !model.name.includes('embedding') &&
          !model.name.includes('vision') // older vision models are deprecated, typically we just want base models
        )
        .map((model: any) => ({
          name: model.name.replace('models/', ''),
          displayName: model.displayName || model.name.replace('models/', ''),
          version: model.version
        }));

      return { success: true, models: validModels };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to fetch models');
    }
  }
}
