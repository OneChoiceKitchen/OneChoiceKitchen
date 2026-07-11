import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // List admin users
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { email: true, role: true },
    take: 10,
  });
  console.log('Current admin users:', JSON.stringify(admins, null, 2));

  // Ensure admin@test.com exists with SUPER_ADMIN role and known password
  const hash = await bcrypt.hash('test123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: hash, role: 'SUPER_ADMIN', name: 'Administrator' },
    create: {
      email: 'admin@test.com',
      name: 'Administrator',
      password: hash,
      role: 'SUPER_ADMIN',
      phone: '+919999999999',
    },
  });
  console.log('✅ admin@test.com is ready:', user.email, user.role);
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
