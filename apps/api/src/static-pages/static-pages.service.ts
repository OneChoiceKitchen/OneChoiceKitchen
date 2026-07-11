import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaticPagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(portal?: string) {
    let whereClause = {};
    if (portal) {
      whereClause = {
        portals: {
          contains: portal
        }
      };
    }
    const pages = await this.prisma.staticPage.findMany({
      where: whereClause,
      orderBy: { section: 'asc' }
    });
    
    // Map string portals to array for frontend
    return pages.map(p => ({
      ...p,
      portals: p.portals ? p.portals.split(',') : ['web']
    }));
  }

  async findOne(slug: string) {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
    });
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return {
      ...page,
      portals: page.portals ? page.portals.split(',') : ['web']
    };
  }

  async create(data: any) {
    return this.prisma.staticPage.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        section: data.section || 'Company',
        isActive: data.isActive !== undefined ? data.isActive : true,
        portals: Array.isArray(data.portals) ? data.portals.join(',') : 'web,partner,rider'
      },
    });
  }

  async update(slug: string, data: any) {
    return this.prisma.staticPage.update({
      where: { slug },
      data: {
        title: data.title,
        content: data.content,
        section: data.section,
        isActive: data.isActive,
        portals: Array.isArray(data.portals) ? data.portals.join(',') : undefined
      },
    });
  }

  async remove(slug: string) {
    return this.prisma.staticPage.delete({
      where: { slug },
    });
  }
}
