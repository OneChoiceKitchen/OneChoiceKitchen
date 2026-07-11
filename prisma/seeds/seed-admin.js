const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const bcrypt = require('bcrypt');

const libsql = createClient({
  url: 'file:dev.db',
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator',
    },
  });

  const password = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@onechoicekitchen.com' },
    update: {
      roleId: superAdminRole.id,
      password,
    },
    create: {
      email: 'admin@onechoicekitchen.com',
      password,
      name: 'Super Admin',
      isActive: true,
      roleId: superAdminRole.id,
    },
  });
  console.log('Seeded SUPER_ADMIN user: admin@onechoicekitchen.com / admin123');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
