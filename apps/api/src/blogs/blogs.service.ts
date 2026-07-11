import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BlogWhereInput;
    orderBy?: Prisma.BlogOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.blog.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async findOne(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { status: 'APPROVED', parentId: null },
          include: { replies: { where: { status: 'APPROVED' } } }
        }
      }
    });
    
    if (!blog) {
      throw new NotFoundException(`Blog with slug ${slug} not found`);
    }
    
    // Increment view count
    await this.prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });
    
    return blog;
  }

  async create(data: Prisma.BlogCreateInput) {
    return this.prisma.blog.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BlogUpdateInput) {
    return this.prisma.blog.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.blog.delete({
      where: { id },
    });
  }

  async getLatest(limit: number = 3) {
    return this.prisma.blog.findMany({
      where: { isActive: true },
      orderBy: { publishDate: 'desc' },
      take: limit,
    });
  }

  async getPopular(limit: number = 3) {
    return this.prisma.blog.findMany({
      where: { isActive: true },
      orderBy: { views: 'desc' },
      take: limit,
    });
  }
}
