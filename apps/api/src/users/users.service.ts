import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto as any,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: { role: true, restaurant: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, restaurant: true }
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getWallet(userId: string) {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    const balance = transactions.reduce((acc, tx) => {
      return tx.type === 'CREDIT' ? acc + tx.amount : acc - tx.amount;
    }, 0);
    
    return { balance, transactions };
  }

  async addAddress(userId: string, addressData: any) {
    if (addressData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return this.prisma.address.create({
      data: {
        ...addressData,
        userId
      }
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  }

  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name, description: `Custom created role: ${name}` }
    });
  }

  async grantPermission(roleId: string, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName }
    });
    if (!permission) throw new Error("Permission not found");

    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id
        }
      },
      create: { roleId, permissionId: permission.id },
      update: {}
    });
  }

  async revokePermission(roleId: string, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName }
    });
    if (!permission) return;

    return this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: permission.id
      }
    });
  }
}
