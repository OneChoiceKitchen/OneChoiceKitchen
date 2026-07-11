import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CommentCreateInput) {
    // Force new comments to be PENDING
    return this.prisma.comment.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  async findByBlog(blogId: string) {
    return this.prisma.comment.findMany({
      where: {
        blogId,
        status: 'APPROVED',
        parentId: null,
      },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          include: {
            replies: {
              where: { status: 'APPROVED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(statusFilter?: string) {
    const where = statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : {};
    return this.prisma.comment.findMany({
      where,
      include: {
        blog: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput) {
    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
