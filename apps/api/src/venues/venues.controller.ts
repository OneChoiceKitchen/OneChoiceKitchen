import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  create(@Body() createVenueDto: any) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.venuesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVenueDto: any) {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
