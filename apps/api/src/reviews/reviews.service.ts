import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getPublicReviews() {
    return this.prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 for performance
    });
  }

  async getAllReviewsAdmin() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createReview(data: any) {
    return this.prisma.review.create({
      data: {
        customerName: data.customerName,
        rating: data.rating,
        comment: data.comment,
        photoUrl: data.photoUrl,
        userId: data.userId,
        status: data.status || 'PENDING'
      }
    });
  }

  async updateReviewStatus(id: string, status: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { status }
    });
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({
      where: { id }
    });
  }
}
