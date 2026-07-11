const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findFirst();
  console.log('SETTINGS:', settings);
  
  if (settings) {
    await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        siteName: 'One Choice Kitchen',
        tagline: 'Online Home-Style Food, Tiffin, Meal & Dining Services'
      }
    });
    console.log("Updated settings");
  }

  const seo = await prisma.seoMetadata.findUnique({
    where: { pageName: 'home' }
  });
  
  if (seo) {
    await prisma.seoMetadata.update({
      where: { pageName: 'home' },
      data: {
        title: 'One Choice Kitchen - Online Home-Style Food, Tiffin, Meal & Dining Services'
      }
    });
    console.log("Updated seo title");
  } else {
    await prisma.seoMetadata.create({
      data: {
        pageName: 'home',
        title: 'One Choice Kitchen - Online Home-Style Food, Tiffin, Meal & Dining Services'
      }
    });
    console.log("Created seo title");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
