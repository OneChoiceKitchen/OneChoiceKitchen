const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { join } = require('path');

const adapter = new PrismaBetterSqlite3({ url: join(process.cwd(), 'dev.db') });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.seoMetadata.updateMany({
    where: { pageName: 'home' },
    data: { 
      title: 'One Choice Kitchen - Dynamic SaaS Food & Meal Subscriptions',
      description: 'Dynamic SaaS homestyle food menus & meal tiffin subscription system.'
    }
  });
  console.log('Updated SEO metadata');
}

main().finally(() => prisma.$disconnect());
