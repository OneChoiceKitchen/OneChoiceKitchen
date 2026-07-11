import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.employee.create({ data });
  }

  async findAll() {
    return this.prisma.employee.findMany({ include: { shifts: true } });
  }

  async update(id: string, data: any) {
    const item = await this.prisma.employee.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Employee not found');
    }
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }

  async assignShift(employeeId: string, shiftData: any) {
    return this.prisma.shift.create({
      data: {
        ...shiftData,
        employeeId,
      }
    });
  }

  async removeShift(shiftId: string) {
    return this.prisma.shift.delete({ where: { id: shiftId } });
  }

  // LEAVES MANAGEMENT
  async getLeaves() {
    return this.prisma.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyLeaves(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) return [];
    
    return this.prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async requestLeave(userId: string, leaveData: any) {
    let employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) {
      // Auto-create employee record for the user to maintain foreign key integrity
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      employee = await this.prisma.employee.create({
        data: {
          userId,
          name: user?.name || 'Unknown',
          email: user?.email || `temp-${userId}@example.com`,
        }
      });
    }

    return this.prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: leaveData.leaveType || 'CASUAL',
        startDate: new Date(leaveData.startDate || Date.now()),
        endDate: new Date(leaveData.endDate || Date.now()),
        comments: leaveData.comments || '',
        status: 'PENDING',
      }
    });
  }

  async updateLeaveStatus(id: string, status: string, approverId: string, comments?: string) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: approverId,
        ...(comments && { comments })
      }
    });
  }

  // HRMS - ATTENDANCE
  async checkIn(userId: string, data: any) {
    let employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile required for attendance');

    // Simple Geofence verification logic using Haversine could be placed here
    
    return this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: new Date(),
        checkInTime: new Date(),
        status: 'PRESENT',
        photoUrl: data.photoUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        deviceInfo: data.deviceInfo,
        isVerified: data.isVerified || false,
      }
    });
  }

  async checkOut(userId: string, data: any) {
    let employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee profile required');

    // Find active attendance for today
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const attendance = await this.prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: { gte: startOfDay }, checkOutTime: null }
    });
    
    if (!attendance) throw new NotFoundException('No active check-in found for today');

    const checkOutTime = new Date();
    const workingMins = Math.floor((checkOutTime.getTime() - attendance.checkInTime!.getTime()) / 60000);
    const overtimeMins = workingMins > 480 ? workingMins - 480 : 0; // assuming 8 hours

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOutTime, workingMins, overtimeMins }
    });
  }

  async getAttendance(userId?: string) {
    if (userId) {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      if (!emp) return [];
      return this.prisma.attendance.findMany({ where: { employeeId: emp.id }, orderBy: { date: 'desc' } });
    }
    return this.prisma.attendance.findMany({ include: { employee: true }, orderBy: { date: 'desc' } });
  }

  // HRMS - PAYROLL
  async generatePayroll(employeeId: string, month: number, year: number) {
    // Basic simplified logic
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException('Employee not found');
    
    return this.prisma.payroll.create({
      data: {
        employeeId, month, year,
        basicSalary: emp.baseSalary,
        allowances: 0, deductions: 0,
        netSalary: emp.baseSalary,
        status: 'PENDING'
      }
    });
  }

  async getPayrolls(userId?: string) {
    if (userId) {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      if (!emp) return [];
      return this.prisma.payroll.findMany({ where: { employeeId: emp.id }, orderBy: { createdAt: 'desc' } });
    }
    return this.prisma.payroll.findMany({ include: { employee: true }, orderBy: { createdAt: 'desc' } });
  }

  // HRMS - DOCUMENTS
  async uploadDocument(userId: string, type: string, url: string) {
    let emp = await this.prisma.employee.findUnique({ where: { userId } });
    if (!emp) throw new NotFoundException('Employee profile required');
    return this.prisma.employeeDocument.create({
      data: { employeeId: emp.id, documentType: type, fileUrl: url }
    });
  }

  async getDocuments(userId?: string) {
    if (userId) {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      if (!emp) return [];
      return this.prisma.employeeDocument.findMany({ where: { employeeId: emp.id } });
    }
    return this.prisma.employeeDocument.findMany({ include: { employee: true } });
  }

  // GEOFENCE CONFIG
  async upsertGeofence(restaurantId: string, lat: number, lng: number, radius: number) {
    return this.prisma.geofenceConfig.upsert({
      where: { restaurantId },
      update: { latitude: lat, longitude: lng, radiusMeters: radius },
      create: { restaurantId, latitude: lat, longitude: lng, radiusMeters: radius }
    });
  }
}
