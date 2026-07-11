import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.eventCategory.create({ data });
  }

  async findAll() {
    return this.prisma.eventCategory.findMany({
      include: {
        _count: {
          select: { halls: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: any) {
    return this.prisma.eventCategory.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.eventCategory.delete({
      where: { id }
    });
  }
}
