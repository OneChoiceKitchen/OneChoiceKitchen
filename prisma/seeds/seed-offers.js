const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.tiffinOffer.createMany({
    data: [
      {
        title: 'Up to 15% Off on 2 Bookings',
        description: 'Make a minimum of two simultaneous bookings in a single transaction and unlock an exclusive discount.',
        imageUrl: '/images/tiffin/offer-1.jpg',
        isHero: false,
        appliesToTiffin: true,
        appliesToMenu: true,
        appliesToHome: true,
        isActive: true
      },
      {
        title: 'Free Fresh Juice or Shake',
        description: 'Enjoy one complimentary fresh juice or delicious shake, one day every single week.',
        imageUrl: '/images/tiffin/offer-2.jpg',
        isHero: false,
        appliesToTiffin: true,
        appliesToMenu: true,
        appliesToHome: true,
        isActive: true
      },
      {
        title: 'Save up to 30% Off',
        description: 'Exclusive Corporate Bulk Booking Discount. Valid for corporate concurrent bookings.',
        imageUrl: '/images/tiffin/offer-3.jpg',
        isHero: false,
        appliesToTiffin: true,
        appliesToMenu: true,
        appliesToHome: true,
        isActive: true
      },
      {
        title: '10% Discount on Monthly Booking',
        description: 'Get the best value for your extended plans! Choose our monthly booking option and automatically receive a 10% discount.',
        imageUrl: '/images/tiffin/offer-4.jpg',
        isHero: true,
        appliesToTiffin: true,
        appliesToMenu: true,
        appliesToHome: true,
        isActive: true
      }
    ]
  });
  console.log('Seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
