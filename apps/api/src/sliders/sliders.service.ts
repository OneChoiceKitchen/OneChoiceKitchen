import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SlidersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.portalSlider.findMany({
      orderBy: { orderIndex: 'asc' }
    });
  }

  async findByPortal(portal: string) {
    return this.prisma.portalSlider.findMany({
      where: { portal, isActive: true },
      orderBy: { orderIndex: 'asc' }
    });
  }

  async findOne(id: string) {
    const slider = await this.prisma.portalSlider.findUnique({
      where: { id },
    });
    if (!slider) throw new NotFoundException(`Slider ${id} not found`);
    return slider;
  }

  async create(data: any) {
    return this.prisma.portalSlider.create({
      data: {
        portal: data.portal || 'web',
        title: data.title,
        description: data.description,
        buttonText: data.buttonText,
        link: data.link,
        bgColor: data.bgColor,
        fontColor: data.fontColor,
        btnColor: data.btnColor,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
        orderIndex: data.orderIndex || 0
      }
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id); // Ensure exists
    return this.prisma.portalSlider.update({
      where: { id },
      data: {
        portal: data.portal,
        title: data.title,
        description: data.description,
        buttonText: data.buttonText,
        link: data.link,
        bgColor: data.bgColor,
        fontColor: data.fontColor,
        btnColor: data.btnColor,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        orderIndex: data.orderIndex
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.portalSlider.delete({
      where: { id },
    });
  }
}
