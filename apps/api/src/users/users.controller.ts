import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';
import { PermissionsGuard } from '../app/auth/permissions.guard';
import { Permissions } from '../app/auth/permissions.decorator';
import { PERMISSIONS } from '../app/auth/permissions.constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('permissions')
  getPermissions() {
    return this.usersService.getPermissions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('roles')
  createRole(@Body() body: { name: string }) {
    return this.usersService.createRole(body.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('roles/:id/grant-permission')
  grantPermission(@Param('id') roleId: string, @Body() body: { permission: string }) {
    return this.usersService.grantPermission(roleId, body.permission);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('roles/:id/revoke-permission')
  revokePermission(@Param('id') roleId: string, @Body() body: { permission: string }) {
    return this.usersService.revokePermission(roleId, body.permission);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.usersService.findOne(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.usersService.update(req.user?.userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/verify-email')
  verifyEmail(@Req() req: any) {
    // In a real app, send email with token, then verify it.
    // Simulating instant verification for now
    return this.usersService.update(req.user?.userId, { emailVerified: true } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/verify-mobile')
  verifyMobile(@Req() req: any) {
    return this.usersService.update(req.user?.userId, { mobileVerified: true } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/verify-whatsapp')
  verifyWhatsapp(@Req() req: any) {
    return this.usersService.update(req.user?.userId, { whatsappVerified: true } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/deactivate')
  deactivateAccount(@Req() req: any) {
    return this.usersService.update(req.user?.userId, { deactivatedAt: new Date() } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/delete')
  requestAccountDeletion(@Req() req: any) {
    return this.usersService.update(req.user?.userId, { isActive: false, deactivatedAt: new Date() } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  getWalletBalance(@Req() req: any) {
    return this.usersService.getWallet(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addresses')
  addAddress(@Req() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user?.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('addresses/:addressId/default')
  setDefaultAddress(@Req() req: any, @Param('addressId') addressId: string) {
    return this.usersService.setDefaultAddress(req.user?.userId, addressId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_USERS)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_USERS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_USERS)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_USERS)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
