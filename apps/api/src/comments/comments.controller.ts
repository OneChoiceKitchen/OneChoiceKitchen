import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: Prisma.CommentCreateInput) {
    return this.commentsService.create(createCommentDto);
  }

  @Get('blog/:blogId')
  findByBlog(@Param('blogId') blogId: string) {
    return this.commentsService.findByBlog(blogId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/all')
  findAllAdmin(@Query('status') status?: string) {
    return this.commentsService.findAllAdmin(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('admin/:id')
  update(@Param('id') id: string, @Body() updateData: Prisma.CommentUpdateInput) {
    return this.commentsService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
