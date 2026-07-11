import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { PartnerPermissionsService, PermissionEntry } from './partner-permissions.service';

@ApiTags('Partner Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PartnerPermissionsController {
  constructor(private readonly svc: PartnerPermissionsService) {}

  // ── Admin endpoints ────────────────────────────────────────────────────────

  @Get('admin/partner-permissions/:partnerId')
  @ApiOperation({ summary: 'Admin: get all feature permissions for a partner' })
  getPermissions(@Param('partnerId') partnerId: string) {
    return this.svc.getPermissions(partnerId);
  }

  @Post('admin/partner-permissions/:partnerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: bulk-set permissions for a partner' })
  setPermissions(
    @Param('partnerId') partnerId: string,
    @Body() body: { permissions: PermissionEntry[] },
    @Request() req: any,
  ) {
    return this.svc.setPermissions(partnerId, body.permissions, req.user.id);
  }

  @Get('admin/partner-permissions/delete-requests')
  @ApiOperation({ summary: 'Admin: list all delete requests' })
  listDeleteRequests(@Query('status') status?: string) {
    return this.svc.listDeleteRequests(status);
  }

  @Post('admin/partner-permissions/delete-requests/:reqId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: approve a delete request' })
  approveDelete(@Param('reqId') reqId: string, @Request() req: any) {
    return this.svc.approveDeleteRequest(reqId, req.user.id);
  }

  @Post('admin/partner-permissions/delete-requests/:reqId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: reject a delete request' })
  rejectDelete(@Param('reqId') reqId: string, @Request() req: any) {
    return this.svc.rejectDeleteRequest(reqId, req.user.id);
  }

  // ── Partner endpoints ──────────────────────────────────────────────────────

  @Get('partner/my-permissions')
  @ApiOperation({ summary: 'Partner: get own module permissions' })
  getMyPermissions(@Request() req: any) {
    return this.svc.getMyPermissions(req.user.id);
  }

  @Post('partner/delete-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Partner: submit a delete request (requires admin approval)' })
  submitDeleteRequest(
    @Request() req: any,
    @Body() body: { module: string; entity: string; entityId: string; reason?: string },
  ) {
    return this.svc.submitDeleteRequest(req.user.id, body.module, body.entity, body.entityId, body.reason);
  }
}
