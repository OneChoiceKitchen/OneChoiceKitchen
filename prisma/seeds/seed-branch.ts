import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Find or Create Restaurant
  let restaurant = await prisma.restaurant.findFirst({
    where: { name: 'One Choice Kitchen' }
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'One Choice Kitchen',
        ownerName: 'Admin',
        email: 'admin@onechoicekitchen.com',
        mobile: '9999999999'
      }
    });
    console.log('Created Restaurant:', restaurant.id);
  } else {
    console.log('Found existing Restaurant:', restaurant.id);
  }

  // Find or Create Branch
  let branch = await prisma.restaurantBranch.findFirst({
    where: { name: 'Ramkrishna Nagar' }
  });

  if (!branch) {
    branch = await prisma.restaurantBranch.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Ramkrishna Nagar',
        address: 'Ramkrishna Nagar Main Road',
        city: 'Patna',
        phone: '9999999999',
        email: 'ramkrishna@onechoicekitchen.com'
      }
    });
    console.log('Created Branch:', branch.id);
  } else {
    console.log('Branch already exists:', branch.id);
  }
  
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
