const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { join } = require('path');

const adapter = new PrismaLibSql({ url: 'file:' + join(__dirname, '../dev.db') });
const prisma = new PrismaClient({ adapter });

async function run() {
  const c = await prisma.menuItem.count();
  console.log('Total menu items:', c);
}

run().finally(() => prisma.$disconnect());
