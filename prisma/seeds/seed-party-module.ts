import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting Party Booking Module seed...');

  // Get first restaurant and admin user for relations
  const restaurant = await prisma.restaurant.findFirst();
  const adminUser = await prisma.user.findFirst();
  
  if (!restaurant || !adminUser) {
    console.error('No restaurant or admin user found. Please run base seeders first.');
    return;
  }

  // 1. Seed Event Categories
  console.log('Seeding Event Categories...');
  const categories = [
    { name: 'Marriage', description: 'Grand wedding ceremonies' },
    { name: 'Birthday Party', description: 'Fun filled birthday celebrations' },
    { name: 'Corporate Event', description: 'Professional corporate gatherings' },
    { name: 'Family Get-together', description: 'Intimate family meetups' },
    { name: 'Kitty Party', description: 'Social gatherings for women' },
    { name: 'Baby Shower', description: 'Blessing the new mother' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.eventCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories.push(created);
  }

  // 2. Seed Halls (Venues)
  console.log('Seeding Halls...');
  const halls = [
    {
      restaurantId: restaurant.id,
      categoryId: createdCategories[0].id,
      name: 'Grand Royal Banquet',
      description: 'Luxurious banquet hall perfect for marriages.',
      minCapacity: 100,
      maxCapacity: 500,
      basePrice: 50000,
      amenities: 'AC, Stage, DJ Setup, Valet Parking, Bridal Room',
      galleryUrls: JSON.stringify(['/images/hall1.jpg', '/images/hall2.jpg']),
      locationString: 'Main City Center, Patna',
    },
    {
      restaurantId: restaurant.id,
      categoryId: createdCategories[2].id,
      name: 'Executive Conference Hall',
      description: 'Modern hall for corporate events and meetings.',
      minCapacity: 20,
      maxCapacity: 100,
      basePrice: 15000,
      amenities: 'AC, Projector, Wi-Fi, Whiteboard, Coffee Machine',
      galleryUrls: JSON.stringify(['/images/conf1.jpg', '/images/conf2.jpg']),
      locationString: 'Business District, Patna',
    },
    {
      restaurantId: restaurant.id,
      categoryId: createdCategories[1].id,
      name: 'Sapphire Party Lounge',
      description: 'Vibrant lounge for birthdays and parties.',
      minCapacity: 10,
      maxCapacity: 50,
      basePrice: 8000,
      amenities: 'AC, Music System, Disco Lights, Bar Setup',
      galleryUrls: JSON.stringify(['/images/party1.jpg']),
      locationString: 'West End Mall, Patna',
    },
  ];

  const createdHalls = [];
  for (const hall of halls) {
    const created = await prisma.hall.create({
      data: hall,
    });
    createdHalls.push(created);
  }

  // 3. Seed Menu Items (if not exists)
  const menuItems = await prisma.menuItem.findMany({ take: 5 });
  if (menuItems.length === 0) {
    console.log('No menu items found, skipping food package items...');
  }

  // 4. Seed Food Packages
  console.log('Seeding Food Packages...');
  const foodPackages = [
    {
      restaurantId: restaurant.id,
      name: 'Premium Veg Buffet',
      description: 'Extravagant pure vegetarian spread.',
      type: 'VEG',
      mealType: 'Dinner',
      pricePerPlate: 800,
      minGuests: 50,
    },
    {
      restaurantId: restaurant.id,
      name: 'Standard Mixed Buffet',
      description: 'Mix of veg and non-veg delicacies.',
      type: 'MIXED',
      mealType: 'Lunch',
      pricePerPlate: 1200,
      minGuests: 30,
    },
    {
      restaurantId: restaurant.id,
      name: 'Corporate High Tea',
      description: 'Light snacks and beverages.',
      type: 'VEG',
      mealType: 'Snacks',
      pricePerPlate: 400,
      minGuests: 20,
    }
  ];

  const createdPackages = [];
  for (const pkg of foodPackages) {
    const created = await prisma.foodPackage.create({
      data: pkg,
    });
    createdPackages.push(created);
  }

  // Assign items to first package if available
  if (menuItems.length > 0 && createdPackages.length > 0) {
    for (const item of menuItems) {
      await prisma.foodPackageItem.create({
        data: {
          foodPackageId: createdPackages[0].id,
          menuItemId: item.id
        }
      });
    }
  }

  // 5. Seed Addon Packages (Decoration, DJ)
  console.log('Seeding Addon Packages...');
  const addons = [
    {
      restaurantId: restaurant.id,
      name: 'Floral Stage Decoration',
      description: 'Premium fresh flowers decoration for the main stage.',
      type: 'Decoration',
      price: 15000,
    },
    {
      restaurantId: restaurant.id,
      name: 'Professional DJ & Sound',
      description: 'Top-tier sound system with professional DJ.',
      type: 'Entertainment',
      price: 8000,
    }
  ];

  const createdAddons = [];
  for (const addon of addons) {
    const created = await prisma.addonPackage.create({
      data: addon,
    });
    createdAddons.push(created);
  }

  // 6. Seed Hall Bookings
  console.log('Seeding Hall Bookings...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const bookings = [
    {
      customerId: adminUser.id,
      hallId: createdHalls[0].id,
      foodPackageId: createdPackages[0].id,
      eventDate: tomorrow,
      startTime: '19:00',
      endTime: '23:59',
      guestCount: 200,
      status: 'CONFIRMED',
      totalAmount: createdHalls[0].basePrice + (200 * createdPackages[0].pricePerPlate) + createdAddons[0].price,
      advanceAmount: 50000,
      balanceAmount: (createdHalls[0].basePrice + (200 * createdPackages[0].pricePerPlate) + createdAddons[0].price) - 50000,
      specialRequests: 'Please ensure stage is ready by 6 PM.',
    },
    {
      customerId: adminUser.id,
      hallId: createdHalls[1].id,
      foodPackageId: createdPackages[2].id,
      eventDate: nextWeek,
      startTime: '10:00',
      endTime: '17:00',
      guestCount: 50,
      status: 'PENDING',
      totalAmount: createdHalls[1].basePrice + (50 * createdPackages[2].pricePerPlate),
      advanceAmount: 0,
      balanceAmount: createdHalls[1].basePrice + (50 * createdPackages[2].pricePerPlate),
    }
  ];

  for (const booking of bookings) {
    const created = await prisma.hallBooking.create({
      data: booking,
    });
    
    // Add addon to first booking
    if (booking.status === 'CONFIRMED') {
      await prisma.hallBookingAddon.create({
        data: {
          bookingId: created.id,
          addonPackageId: createdAddons[0].id,
          price: createdAddons[0].price
        }
      });
    }
  }

  console.log('Party Booking Module seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
