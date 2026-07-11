import { Controller, Get, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async getCollections(@Query() query: any) {
    return this.collectionsService.getCollections(query);
  }
}
