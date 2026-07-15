import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantScope: TenantScopeService
  ) {}

  async create(data: any) {
    const tenantId = this.tenantScope.getTenantId();
    if (!tenantId) throw new Error('Tenant context is required');
    
    // Validate category belongs to this tenant
    if (data.categoryId) {
      const category = await this.prisma.menuCategory.findFirst({
        where: this.tenantScope.scopeWhere({ id: data.categoryId })
      });
      if (!category) {
        throw new BadRequestException('Invalid categoryId or category belongs to a different tenant');
      }
    }

    if (data.sortOrder === undefined) {
      const lastItem = await this.prisma.menuItem.findFirst({
        where: { tenantId, categoryId: data.categoryId || null },
        orderBy: { sortOrder: 'desc' }
      });
      data.sortOrder = lastItem ? lastItem.sortOrder + 1 : 0;
    }

    return this.prisma.menuItem.create({
      data: {
        ...data,
        tenantId,
      }
    });
  }

  async findAll() {
    return this.prisma.menuItem.findMany({
      where: this.tenantScope.scopeWhere({ isDeleted: false }),
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: this.tenantScope.scopeWhere({ id, isDeleted: false })
    });
    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, data: any) {
    await this.findOne(id); // Ensure it exists in tenant scope
    
    // Validate category belongs to this tenant if updating category
    if (data.categoryId) {
      const category = await this.prisma.menuCategory.findFirst({
        where: this.tenantScope.scopeWhere({ id: data.categoryId })
      });
      if (!category) {
        throw new BadRequestException('Invalid categoryId or category belongs to a different tenant');
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists in tenant scope
    
    // Soft delete
    return this.prisma.menuItem.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }
}
