const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findFirst();
  console.log('SETTINGS:', settings);
  
  const seo = await prisma.seoMetadata.findMany();
  console.log('SEO:', seo);
  
  // Let's forcefully update the settings to the requested tagline and site name
  if (settings) {
    await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        siteName: 'One Choice Kitchen',
        tagline: 'Online Home-Style Food, Tiffin, Meal & Dining Services'
      }
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
