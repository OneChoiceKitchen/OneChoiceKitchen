import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.inventoryItem.create({ data });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany();
  }

  async update(id: string, data: any) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return this.prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
