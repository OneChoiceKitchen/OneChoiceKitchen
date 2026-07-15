import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Injectable()
export class MenuCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantScope: TenantScopeService
  ) {}

  async create(data: any) {
    const tenantId = this.tenantScope.getTenantId();
    if (!tenantId) throw new Error('Tenant context is required');
    
    // Auto increment sortOrder if not provided
    if (data.sortOrder === undefined) {
      const lastCategory = await this.prisma.menuCategory.findFirst({
        where: { tenantId, branchId: data.branchId || null },
        orderBy: { sortOrder: 'desc' }
      });
      data.sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;
    }

    return this.prisma.menuCategory.create({
      data: {
        ...data,
        tenantId,
      }
    });
  }

  async findAll() {
    return this.prisma.menuCategory.findMany({
      where: this.tenantScope.scopeWhere({}),
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.menuCategory.findFirst({
      where: this.tenantScope.scopeWhere({ id })
    });
    if (!category) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, data: any) {
    await this.findOne(id); // Ensure it exists in tenant scope
    return this.prisma.menuCategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists in tenant scope
    return this.prisma.menuCategory.delete({
      where: { id }
    });
  }
}
