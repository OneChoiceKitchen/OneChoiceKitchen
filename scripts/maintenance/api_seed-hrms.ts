import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), '..', 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding HRMS mock data...');

  // 2. Create a user to map to Employee (if not exists)
  const user = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      email: 'employee@test.com',
      password: 'hashedpassword',
      name: 'John Doe',
      // omitting role for simplicity, or we can fetch a default role
    }
  });

  // 3. Create Employee Profile
  let employee = await prisma.employee.findFirst({
    where: { userId: user.id }
  });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        userId: user.id,
        name: 'John Doe',
        email: 'employee@test.com',
        mobile: '1234567890',
        designation: 'Chef',
        baseSalary: 5000,
        joiningDate: new Date('2025-01-01'),
        status: 'ACTIVE'
      }
    });
  }

  // 4. Create Geofence Config
  await prisma.geofenceConfig.upsert({
    where: { restaurantId: 'dummy-restaurant-id' },
    update: {},
    create: {
      restaurantId: 'dummy-restaurant-id',
      latitude: 40.7128,
      longitude: -74.0060,
      radiusMeters: 100,
    }
  });

  // 5. Create Attendance records
  await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      date: new Date('2026-06-10'),
      checkInTime: new Date('2026-06-10T09:00:00Z'),
      checkOutTime: new Date('2026-06-10T17:00:00Z'),
      status: 'PRESENT',
      workingMins: 480,
      overtimeMins: 0,
      isVerified: true
    }
  });

  await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      date: new Date('2026-06-11'),
      checkInTime: new Date('2026-06-11T09:15:00Z'),
      checkOutTime: new Date('2026-06-11T18:30:00Z'),
      status: 'PRESENT',
      workingMins: 555,
      overtimeMins: 75,
      isVerified: true
    }
  });

  // 6. Create Leave Request
  await prisma.leaveRequest.create({
    data: {
      employeeId: employee.id,
      leaveType: 'SICK',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-16'),
      status: 'APPROVED',
      comments: 'Feeling unwell'
    }
  });

  // 7. Create Payroll
  await prisma.payroll.create({
    data: {
      employeeId: employee.id,
      month: 5,
      year: 2026,
      basicSalary: 5000,
      allowances: 500,
      deductions: 100,
      netSalary: 5400,
      status: 'PAID'
    }
  });

  console.log('Mock data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
