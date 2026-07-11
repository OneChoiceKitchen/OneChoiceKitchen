const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcrypt');
const p = new PrismaClient();

async function main() {
  // Check existing admin users
  const users = await p.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { email: true, role: true },
    take: 10,
  });
  console.log('Existing admin users:', JSON.stringify(users, null, 2));

  // Check if admin@test.com exists
  const existing = await p.user.findUnique({ where: { email: 'admin@test.com' }, select: { email: true, role: true, id: true } });
  console.log('admin@test.com:', JSON.stringify(existing, null, 2));

  if (!existing) {
    // Create admin user
    const hash = await bcrypt.hash('test123', 10);
    const created = await p.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Administrator',
        password: hash,
        role: 'SUPER_ADMIN',
        phone: '+919999999999',
      },
    });
    console.log('Created admin user:', created.email, created.role);
  } else if (existing.role !== 'ADMIN' && existing.role !== 'SUPER_ADMIN') {
    // Upgrade to SUPER_ADMIN
    await p.user.update({ where: { email: 'admin@test.com' }, data: { role: 'SUPER_ADMIN' } });
    console.log('Upgraded admin@test.com to SUPER_ADMIN');
  } else {
    // Reset password just in case
    const hash = await bcrypt.hash('test123', 10);
    await p.user.update({ where: { email: 'admin@test.com' }, data: { password: hash } });
    console.log('Reset password for admin@test.com');
  }
}

main().catch(e => console.error('ERROR:', e.message)).finally(() => p.$disconnect());
