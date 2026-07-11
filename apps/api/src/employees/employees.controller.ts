import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Post()
  create(@Body() data: any) {
    return this.employeesService.create(data);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.employeesService.update(id, data);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Post(':id/shifts')
  assignShift(@Param('id') id: string, @Body() shiftData: any) {
    return this.employeesService.assignShift(id, shiftData);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Delete('shifts/:shiftId')
  removeShift(@Param('shiftId') shiftId: string) {
    return this.employeesService.removeShift(shiftId);
  }

  // LEAVES ENDPOINTS

  @Roles('SUPER_ADMIN', 'PARTNER') // Admins can see all leaves
  @Get('leaves')
  getAllLeaves() {
    return this.employeesService.getLeaves();
  }

  @Get('my-leaves')
  getMyLeaves(@Req() req: any) {
    return this.employeesService.getMyLeaves(req.user.userId);
  }

  @Post('leaves')
  requestLeave(@Req() req: any, @Body() leaveData: any) {
    return this.employeesService.requestLeave(req.user.userId, leaveData);
  }

  @Roles('SUPER_ADMIN', 'PARTNER') // Only admins can approve/reject
  @Patch('leaves/:id/status')
  updateLeaveStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string, comments?: string }) {
    return this.employeesService.updateLeaveStatus(id, body.status, req.user.userId, body.comments);
  }

  // HRMS - ATTENDANCE
  @Post('attendance/check-in')
  checkIn(@Req() req: any, @Body() data: any) {
    return this.employeesService.checkIn(req.user.userId, data);
  }

  @Post('attendance/check-out')
  checkOut(@Req() req: any, @Body() data: any) {
    return this.employeesService.checkOut(req.user.userId, data);
  }

  @Get('my-attendance')
  getMyAttendance(@Req() req: any) {
    return this.employeesService.getAttendance(req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Get('attendance')
  getAllAttendance() {
    return this.employeesService.getAttendance();
  }

  // HRMS - PAYROLL
  @Roles('SUPER_ADMIN', 'PARTNER')
  @Post(':id/payroll/generate')
  generatePayroll(@Param('id') employeeId: string, @Body() data: { month: number, year: number }) {
    return this.employeesService.generatePayroll(employeeId, data.month, data.year);
  }

  @Get('my-payroll')
  getMyPayroll(@Req() req: any) {
    return this.employeesService.getPayrolls(req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Get('payroll')
  getAllPayrolls() {
    return this.employeesService.getPayrolls();
  }

  // HRMS - DOCUMENTS
  @Post('documents/upload')
  uploadDocument(@Req() req: any, @Body() data: { type: string, url: string }) {
    return this.employeesService.uploadDocument(req.user.userId, data.type, data.url);
  }

  @Get('my-documents')
  getMyDocuments(@Req() req: any) {
    return this.employeesService.getDocuments(req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'PARTNER')
  @Get('documents')
  getAllDocuments() {
    return this.employeesService.getDocuments();
  }

  // GEOFENCE CONFIG
  @Roles('SUPER_ADMIN', 'PARTNER')
  @Post('geofence')
  upsertGeofence(@Body() data: { restaurantId: string, lat: number, lng: number, radius: number }) {
    return this.employeesService.upsertGeofence(data.restaurantId, data.lat, data.lng, data.radius);
  }
}
