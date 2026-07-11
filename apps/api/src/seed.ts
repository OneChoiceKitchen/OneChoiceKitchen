import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const sliders = [
    {
      title: 'Delicious Tiffin Service',
      description: 'Subscribe to our healthy and fresh daily tiffins.',
      buttonText: 'View Plans',
      link: '/tiffin',
      bgColor: 'linear-gradient(135deg, #ef4444, #991b1b)',
      portal: 'web',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
    },
    {
      title: 'Special Weekend Menu',
      description: 'Treat yourself with our special weekend menu items.',
      buttonText: 'Order Now',
      link: '/menu',
      bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      portal: 'web',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    },
    {
      title: 'Boost Your Sales',
      description: 'Join our premium kitchen program to get 30% more visibility.',
      buttonText: 'Learn More',
      link: '#',
      bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)',
      portal: 'partner',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'
    },
    {
      title: 'New Feature: Analytics',
      description: 'Track your live orders and revenue from the new analytics tab.',
      buttonText: 'View Dashboard',
      link: '#',
      bgColor: 'linear-gradient(135deg, #10b981, #047857)',
      portal: 'partner',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
    },
    {
      title: 'Earn More with Surge Pricing',
      description: 'Deliver during peak hours to earn up to 1.5x on every order.',
      buttonText: 'Check Timings',
      link: '#',
      bgColor: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
      portal: 'rider',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'
    },
    {
      title: 'Safety Guidelines',
      description: 'Please ensure you wear a mask and sanitize hands regularly.',
      buttonText: 'Read Rules',
      link: '#',
      bgColor: 'linear-gradient(135deg, #ec4899, #be185d)',
      portal: 'rider',
      isActive: true,
      fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800'
    }
  ];

  // delete old sliders
  await prisma.portalSlider.deleteMany({});
  
  for (const s of sliders) {
    await prisma.portalSlider.create({ data: s });
  }
  console.log('Seeded sliders successfully');

  // Seed Roles and Admin User
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator',
    },
  });

  const bcrypt = require('bcrypt');
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
