import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getAllMenus(restaurantId?: string, branchId?: string, userLat?: number, userLng?: number) {
    const where: any = { isDeleted: false };
    if (restaurantId) where.restaurantId = restaurantId;
    
    // If branchId is explicitly provided, we want items for this branch OR global items (branchId = null)
    if (branchId) {
      where.OR = [
        { branchId },
        { branchId: null }
      ];
    }
    
    if (userLat !== undefined && userLng !== undefined && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      const deliverySetting = await this.prisma.deliverySetting.findFirst();
      const margin = deliverySetting?.enableDistanceMargin ? (deliverySetting.distanceMarginValue || 0) : 0;
      
      const branches = await this.prisma.restaurantBranch.findMany({
        where: { lat: { not: null }, lng: { not: null } }
      });
      
      const MAX_RADIUS_KM = 10;
      
      const closeBranchIds = branches.filter(branch => {
        if (!branch.lat || !branch.lng) return false;
        const dist = this.calculateDistance(userLat, userLng, branch.lat, branch.lng);
        return dist <= (MAX_RADIUS_KM + margin);
      }).map(b => b.id);
      
      if (closeBranchIds.length === 0) {
        return []; // No branches nearby, so no items
      }
      
      // Combine with existing OR if any
      const locationOrClause = [
        { branchId: { in: closeBranchIds } },
        { branchId: null }
      ];
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: locationOrClause }
        ];
        delete where.OR;
      } else {
        where.OR = locationOrClause;
      }
    }
    
    return this.prisma.menuItem.findMany({
      where,
      include: {
        restaurant: true,
        branch: true,
        attributes: {
          orderBy: { sortOrder: 'asc' },
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
  }

  async getMenuById(id: string) {
    const menu = await this.prisma.menuItem.findFirst({
      where: { id, isDeleted: false },
      include: {
        restaurant: true,
        branch: true,
        attributes: {
          orderBy: { sortOrder: 'asc' },
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
    if (!menu) throw new NotFoundException('Menu item not found');
    return menu;
  }

  async createMenu(data: any) {
    const { attributes, ...menuData } = data;
    
    // Process creation of menu item with nested attributes and options
    return this.prisma.menuItem.create({
      data: {
        ...menuData,
        attributes: {
          create: attributes?.map((attr: any) => ({
            name: attr.name,
            type: attr.type,
            isRequired: attr.isRequired,
            sortOrder: attr.sortOrder,
            options: {
              create: attr.options?.map((opt: any) => ({
                name: opt.name,
                additionalPrice: opt.additionalPrice,
                isDefault: opt.isDefault,
                isAvailable: opt.isAvailable ?? true,
                sortOrder: opt.sortOrder
              })) || []
            }
          })) || []
        }
      },
      include: {
        attributes: {
          include: { options: true }
        }
      }
    });
  }

  async updateMenu(id: string, data: any) {
    const { attributes, ...menuData } = data;
    
    // To cleanly update attributes, the simplest robust way is to delete all existing and recreate them
    if (attributes) {
      await this.prisma.productAttribute.deleteMany({
        where: { menuItemId: id }
      });
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...menuData,
        ...(attributes && {
          attributes: {
            create: attributes.map((attr: any) => ({
              name: attr.name,
              type: attr.type,
              isRequired: attr.isRequired,
              sortOrder: attr.sortOrder,
              options: {
                create: attr.options?.map((opt: any) => ({
                  name: opt.name,
                  additionalPrice: opt.additionalPrice,
                  isDefault: opt.isDefault,
                  isAvailable: opt.isAvailable ?? true,
                  sortOrder: opt.sortOrder
                })) || []
              }
            }))
          }
        })
      },
      include: {
        attributes: { include: { options: true } }
      }
    });
  }

  async deleteMenu(id: string) {
    return this.prisma.menuItem.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  async getRecycledMenus() {
    return this.prisma.menuItem.findMany({
      where: { isDeleted: true },
      include: {
        restaurant: true,
        branch: true
      }
    });
  }

  async restoreMenu(id: string) {
    return this.prisma.menuItem.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });
  }

  async hardDeleteMenu(id: string) {
    return this.prisma.menuItem.delete({
      where: { id }
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async generateDescription(name: string) {
    const aiConfig = await this.prisma.aiConfig.findFirst({
      where: { providerName: 'GEMINI', isActive: true }
    });

    const apiKey = aiConfig?.apiKey;
    
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured in the Service Providers page.');
    }

    const prompt = `Write a short, appetizing, 1-2 sentence description for a restaurant menu item named: "${name}". Do not use quotes or formatting, just plain text.`;
    const model = aiConfig?.modelName || 'gemini-1.5-flash-latest';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json() as any;
      if (!response.ok) {
        throw new BadRequestException(data.error?.message || 'Failed to generate description');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { description: text.trim() };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Failed to generate description');
    }
  }
}
