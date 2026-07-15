import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private tenantScope: TenantScopeService
  ) {}

  async create(data: any) {
    const tenantId = this.tenantScope.getTenantId();
    if (!tenantId) throw new Error('Tenant context is required');

    return this.prisma.inventoryItem.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany({
      where: this.tenantScope.scopeWhere({})
    });
  }
  
  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: this.tenantScope.scopeWhere({ id })
    });
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({
      where: { id }
    });
  }

  async mapToMenu(menuItemId: string, inventoryItemId: string, quantityRequired: number) {
    // 1. Verify menuItem belongs to current tenant
    const menuItem = await this.prisma.menuItem.findFirst({
      where: this.tenantScope.scopeWhere({ id: menuItemId, isDeleted: false })
    });
    if (!menuItem) {
      throw new BadRequestException('Invalid menuItemId or item belongs to a different tenant');
    }

    // 2. Verify inventoryItem belongs to current tenant
    const inventoryItem = await this.findOne(inventoryItemId); // Implicitly throws if missing/different tenant
    
    // 3. Create or update mapping
    return this.prisma.menuInventoryMapping.create({
      data: {
        menuItemId,
        inventoryItemId,
        quantityRequired
      }
    });
  }
}
