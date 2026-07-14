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

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        include: { role: true, restaurant: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (!this.isMissingMappedUserTableError(error)) throw error;
      return this.findAllLegacyUsers();
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { role: true, restaurant: true },
      });
    } catch (error) {
      if (!this.isMissingMappedUserTableError(error)) throw error;
      return this.findLegacyUserById(id);
    }
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
      orderBy: { createdAt: 'desc' },
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
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  async getRoles() {
    try {
      return await this.prisma.role.findMany({
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    } catch (error) {
      if (!this.isMissingMappedRoleTableError(error)) throw error;
      return this.findLegacyRoles();
    }
  }

  async getPermissions() {
    try {
      return await this.prisma.permission.findMany();
    } catch (error) {
      if (!this.isMissingMappedPermissionTableError(error)) throw error;
      return this.prisma.$queryRaw<any[]>`SELECT * FROM "Permission"`;
    }
  }

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name, description: `Custom created role: ${name}` },
    });
  }

  async grantPermission(roleId: string, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) throw new Error('Permission not found');

    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
      create: { roleId, permissionId: permission.id },
      update: {},
    });
  }

  async revokePermission(roleId: string, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) return;

    return this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: permission.id,
      },
    });
  }

  private async findAllLegacyUsers() {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "User" ORDER BY "createdAt" DESC
    `;
    return Promise.all(
      users.map((user) => this.attachLegacyUserRelations(user)),
    );
  }

  private async findLegacyUserById(id: string) {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "User" WHERE "id" = ${id} LIMIT 1
    `;
    return users[0] ? this.attachLegacyUserRelations(users[0]) : null;
  }

  private async attachLegacyUserRelations(user: any) {
    const [role] = user.roleId
      ? await this.prisma.$queryRaw<any[]>`
          SELECT * FROM "Role" WHERE "id" = ${user.roleId} LIMIT 1
        `
      : [null];
    const [restaurant] = user.restaurantId
      ? await this.prisma.$queryRaw<any[]>`
          SELECT * FROM "Restaurant" WHERE "id" = ${user.restaurantId} LIMIT 1
        `
      : [null];
    return { ...user, role: role ?? null, restaurant: restaurant ?? null };
  }

  private async findLegacyRoles() {
    const roles = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Role" ORDER BY "createdAt" DESC
    `;
    return Promise.all(
      roles.map(async (role) => {
        const permissions = await this.prisma.$queryRaw<any[]>`
          SELECT
            rp."roleId",
            rp."permissionId",
            p."id",
            p."name",
            p."description",
            p."createdAt"
          FROM "RolePermission" rp
          INNER JOIN "Permission" p ON p."id" = rp."permissionId"
          WHERE rp."roleId" = ${role.id}
        `;
        return {
          ...role,
          permissions: permissions.map((row) => ({
            roleId: row.roleId,
            permissionId: row.permissionId,
            permission: {
              id: row.id,
              name: row.name,
              description: row.description,
              createdAt: row.createdAt,
            },
          })),
        };
      }),
    );
  }

  private isMissingMappedUserTableError(error: unknown): boolean {
    return this.isMissingMappedTableError(error, 'cat_customers');
  }

  private isMissingMappedRoleTableError(error: unknown): boolean {
    return this.isMissingMappedTableError(error, 'cat_roles');
  }

  private isMissingMappedPermissionTableError(error: unknown): boolean {
    return this.isMissingMappedTableError(error, 'cat_permissions');
  }

  private isMissingMappedTableError(
    error: unknown,
    tableName: string,
  ): boolean {
    if (process.env.NODE_ENV === 'production') return false;

    const escapedTableName = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'cause' in error
          ? JSON.stringify((error as { cause?: unknown }).cause)
          : String(error);
    return new RegExp(
      `no such table:\\s*(main\\.)?${escapedTableName}`,
      'i',
    ).test(message);
  }
}
