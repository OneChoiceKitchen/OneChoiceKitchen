const { PrismaClient } = require('./api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.seoMetadata.upsert({
    where: { pageName: 'home' },
    update: { title: 'One Choice Kitchen - Online Home-Style Food, Tiffin, Meal & Dining Services' },
    create: { 
      pageName: 'home', 
      title: 'One Choice Kitchen - Online Home-Style Food, Tiffin, Meal & Dining Services' 
    }
  });
  console.log('SEO title updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
