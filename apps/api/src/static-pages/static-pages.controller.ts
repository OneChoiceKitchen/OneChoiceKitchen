import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { StaticPagesService } from './static-pages.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('static-pages')
export class StaticPagesController {
  constructor(private readonly staticPagesService: StaticPagesService) {}

  @Get()
  findAll(@Query('portal') portal?: string) {
    return this.staticPagesService.findAll(portal);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.staticPagesService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() createData: any) {
    return this.staticPagesService.create(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put(':slug')
  update(@Param('slug') slug: string, @Body() updateData: any) {
    return this.staticPagesService.update(slug, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.staticPagesService.remove(slug);
  }
}
