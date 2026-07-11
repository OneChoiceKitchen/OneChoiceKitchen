import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('public')
  getPublicReviews() {
    return this.reviewsService.getPublicReviews();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin')
  getAllReviewsAdmin() {
    return this.reviewsService.getAllReviewsAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Body() body: any) {
    return this.reviewsService.createReview(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('admin/:id/status')
  updateReviewStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.reviewsService.updateReviewStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('admin/:id')
  deleteReview(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
