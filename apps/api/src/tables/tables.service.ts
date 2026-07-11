import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId?: string, branchId?: string) {
    const where: any = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    
    return this.prisma.restaurantTable.findMany({
      where,
      include: {
        reservations: {
          where: { status: 'SEATED' }
        }
      },
      orderBy: { tableNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.restaurantTable.findUnique({
      where: { id },
    });
    if (!table) {
      throw new NotFoundException(`Table with id ${id} not found`);
    }
    return table;
  }

  async create(data: any) {
    const existing = await this.prisma.restaurantTable.findFirst({
      where: {
        branchId: data.branchId,
        tableNumber: data.tableNumber
      }
    });
    if (existing) {
      throw new ConflictException(`Table with number/name '${data.tableNumber}' already exists in this branch.`);
    }

    return this.prisma.restaurantTable.create({
      data: {
        restaurantId: data.restaurantId,
        branchId: data.branchId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        isAvailable: data.isAvailable ?? true,
        qrCodeUrl: data.qrCodeUrl,
      },
    });
  }

  async update(id: string, data: any) {
    const table = await this.findOne(id);
    if (data.tableNumber && data.tableNumber !== table.tableNumber) {
      const existing = await this.prisma.restaurantTable.findFirst({
        where: {
          branchId: table.branchId,
          tableNumber: data.tableNumber
        }
      });
      if (existing) {
        throw new ConflictException(`Table with number/name '${data.tableNumber}' already exists in this branch.`);
      }
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: {
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        isAvailable: data.isAvailable,
        qrCodeUrl: data.qrCodeUrl,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.restaurantTable.delete({
      where: { id },
    });
  }
}
