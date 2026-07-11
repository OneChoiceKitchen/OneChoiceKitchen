import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PermissionEntry {
  module: string;
  feature: string;
  isEnabled: boolean;
}

@Injectable()
export class PartnerPermissionsService {
  constructor(private prisma: PrismaService) {}

  /** Admin: get all feature permissions for a partner */
  async getPermissions(partnerId: string): Promise<PermissionEntry[]> {
    const rows = await (this.prisma as any).partnerFeaturePermission.findMany({
      where: { partnerId },
    });
    return rows.map((r: any) => ({ module: r.module, feature: r.feature, isEnabled: r.isEnabled }));
  }

  /** Admin: bulk-set permissions for a partner */
  async setPermissions(partnerId: string, permissions: PermissionEntry[], grantedById: string): Promise<void> {
    for (const p of permissions) {
      await (this.prisma as any).partnerFeaturePermission.upsert({
        where: { partnerId_module_feature: { partnerId, module: p.module, feature: p.feature } },
        create: { partnerId, module: p.module, feature: p.feature, isEnabled: p.isEnabled, grantedById },
        update: { isEnabled: p.isEnabled, grantedById },
      });
    }
  }

  /** Partner: get own permissions (called by partner portal on login) */
  async getMyPermissions(partnerId: string): Promise<PermissionEntry[]> {
    return this.getPermissions(partnerId);
  }

  /** Check if a partner has a specific feature enabled */
  async hasFeature(partnerId: string, module: string, feature: string): Promise<boolean> {
    const row = await (this.prisma as any).partnerFeaturePermission.findUnique({
      where: { partnerId_module_feature: { partnerId, module, feature } },
    });
    return row?.isEnabled === true;
  }

  // ── Delete Approval Workflow ────────────────────────────────────────────────

  /** Partner: submit a delete request (does NOT delete — creates approval request) */
  async submitDeleteRequest(partnerId: string, module: string, entity: string, entityId: string, reason?: string) {
    return (this.prisma as any).partnerDeleteRequest.create({
      data: { partnerId, module, entity, entityId, reason, status: 'PENDING' },
    });
  }

  /** Admin: list all delete requests */
  async listDeleteRequests(status?: string) {
    return (this.prisma as any).partnerDeleteRequest.findMany({
      where: status ? { status } : {},
      orderBy: { requestedAt: 'desc' },
    });
  }

  /** Admin: approve a delete request and perform the actual deletion */
  async approveDeleteRequest(reqId: string, reviewedById: string) {
    const req = await (this.prisma as any).partnerDeleteRequest.findUnique({ where: { id: reqId } });
    if (!req) throw new Error('Request not found');

    // Perform actual deletion based on entity type
    await this.executeDelete(req.entity, req.entityId);

    return (this.prisma as any).partnerDeleteRequest.update({
      where: { id: reqId },
      data: { status: 'APPROVED', reviewedById, reviewedAt: new Date() },
    });
  }

  /** Admin: reject a delete request */
  async rejectDeleteRequest(reqId: string, reviewedById: string) {
    return (this.prisma as any).partnerDeleteRequest.update({
      where: { id: reqId },
      data: { status: 'REJECTED', reviewedById, reviewedAt: new Date() },
    });
  }

  /** Execute the actual deletion based on entity type */
  private async executeDelete(entity: string, entityId: string) {
    const entityMap: Record<string, string> = {
      'Offer':    'offer',
      'Coupon':   'coupon',
      'MenuItem': 'menuItem',
      'Venue':    'venue',
      'Package':  'eventPackage',
      'Blog':     'blog',
    };
    const model = entityMap[entity];
    if (model && (this.prisma as any)[model]) {
      await (this.prisma as any)[model].delete({ where: { id: entityId } });
    }
  }
}
