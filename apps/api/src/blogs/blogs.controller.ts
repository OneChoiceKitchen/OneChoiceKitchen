import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() createBlogDto: Prisma.BlogCreateInput) {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  async findAll(
    @Query('category') category?: string, 
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9'
  ) {
    const where: Prisma.BlogWhereInput = {
      isActive: true,
    };
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [data, total] = await Promise.all([
      this.blogsService.findAll({ where, skip, take }),
      // @ts-ignore
      this.blogsService.prisma.blog.count({ where })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  @Get('latest')
  getLatest(@Query('limit') limit: string = '3') {
    return this.blogsService.getLatest(Number(limit));
  }

  @Get('popular')
  getPopular(@Query('limit') limit: string = '3') {
    return this.blogsService.getPopular(Number(limit));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('all')
  findAllAdmin() {
    return this.blogsService.findAll({});
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: Prisma.BlogUpdateInput) {
    return this.blogsService.update(id, updateBlogDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
