const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const dbPath = path.join(__dirname, '../dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

function generateNameFromFilename(filename) {
  let name = filename;
  // Remove extension
  name = name.replace(/\.[^/.]+$/, "");
  // Remove 960px- prefix
  name = name.replace(/^960px-/, "");
  // Remove timestamps like _1780137312575
  name = name.replace(/_\d{13,}/g, "");
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, " ");
  // Decode URL encoding
  name = decodeURIComponent(name);
  // Title case
  name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  return name.trim();
}

async function run() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { name: { contains: 'One Choice Kitchen' } }
  });
  
  if (!restaurant) {
    console.error("Restaurant not found");
    return;
  }

  const existingMenus = await prisma.menuItem.findMany();
  const existingImages = new Set(existingMenus.map(m => m.image));

  const dirPath = path.join(__dirname, '../apps/web/public/MenuItems');
  const files = fs.readdirSync(dirPath);

  let added = 0;
  for (const file of files) {
    const imagePath = `/MenuItems/${file}`;
    if (!existingImages.has(imagePath)) {
      const name = generateNameFromFilename(file);
      
      await prisma.menuItem.create({
        data: {
          name: name || "Unknown Item",
          price: 150, // default price
          category: "Specials",
          description: "Delicious " + (name || "Item"),
          diet: "VEG",
          image: imagePath,
          isAvailable: true,
          restaurantId: restaurant.id
        }
      });
      added++;
      console.log(`Added: ${name} (${imagePath})`);
    }
  }

  console.log(`\nSuccessfully added ${added} new menu items!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
