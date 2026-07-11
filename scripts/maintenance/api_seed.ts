import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { join } from 'path';

const adapter = new PrismaBetterSqlite3({ url: join(process.cwd(), 'dev.db') });
const prisma = new PrismaClient({ adapter });

const DEFAULT_MENU_CATALOGUE = [
  { id: 'item-1', name: 'Paneer Tikka', price: 260, category: 'North Indian', description: 'Clay oven cooked cottage cheese cubes', diet: 'VEG', image: '/MenuItems/paneer_tikka_1780137312575.png', isVisible: true, isOutOfStock: false },
  { id: 'item-2', name: 'Butter Chicken', price: 340, category: 'North Indian', description: 'Tender chicken in rich creamy tomato gravy', diet: 'NON-VEG', image: '/MenuItems/butter_chicken_1780137244502.png', isVisible: true, isOutOfStock: false },
  { id: 'item-3', name: 'Veg Hakka Noodles', price: 180, category: 'Chinese', description: 'Stir-fried noodles with garden fresh vegetables', diet: 'VEG', image: '/MenuItems/veg_noodles_1780137333130.png', isVisible: true, isOutOfStock: false },
  { id: 'item-4', name: 'Manchurian Gravy', price: 210, category: 'Chinese', description: 'Vegetable dumplings in spicy soy garlic sauce', diet: 'VEG', image: '/MenuItems/manchurian_1780137296128.png', isVisible: true, isOutOfStock: false },
  { id: 'item-5', name: 'Cold Coffee', price: 120, category: 'Beverages', description: 'Creamy espresso shake served chilled', diet: 'VEG', image: '/MenuItems/cold_coffee_1780137276932.png', isVisible: true, isOutOfStock: false },
  { id: 'item-6', name: 'Chocolate Brownie', price: 150, category: 'Desserts', description: 'Warm fudgy brownie with chocolate syrup', diet: 'VEG', image: '/MenuItems/chocolate_brownie_1780137260370.png', isVisible: true, isOutOfStock: false },
  { id: 'item-7', name: 'Dal Makhani', price: 220, category: 'North Indian', description: 'Slow cooked black lentils with butter and cream', diet: 'VEG', image: '/MenuItems/dal_makhani_1780087988049.png', isVisible: true, isOutOfStock: false },
  { id: 'item-8', name: 'Kadai Paneer', price: 280, category: 'North Indian', description: 'Paneer cooked with bell peppers and ground spices', diet: 'VEG', image: '/MenuItems/kadai_paneer_1780088004507.png', isVisible: true, isOutOfStock: false },
  { id: 'item-28', name: 'Margherita Pizza', price: 250, category: 'Fast Food', description: 'Classic pizza with tomato sauce and mozzarella', diet: 'VEG', image: '/MenuItems/margherita_pizza_1780088072576.png', isVisible: true, isOutOfStock: false },
];

const DEFAULT_SLIDERS = [
  { id: 'slider-1', title: 'Welcome Offer', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070', linkUrl: '/offers', isActive: true },
  { id: 'slider-2', title: 'Tiffin Services', imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2070', linkUrl: '/tiffin', isActive: true },
];

const DEFAULT_TIFFINS = [
  { id: 'tiffin-1', name: 'Classic Veg Thali', mealType: 'Lunch', dietType: 'Vegetarian', price: 120, description: 'Roti, Dal, Sabzi, Rice, Salad', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070' },
  { id: 'tiffin-2', name: 'Premium Non-Veg Thali', mealType: 'Dinner', dietType: 'Non-Vegetarian', price: 180, description: 'Chicken Curry, Roti, Rice, Dessert', image: 'https://images.unsplash.com/photo-1631452180519-c014dfaa7802?q=80&w=2070' },
];

const DEFAULT_BLOGS = [
  { id: 'blog-1', title: 'Healthy Eating Habits', slug: 'healthy-eating-habits', category: 'Health', author: 'Chef John', excerpt: 'Discover the secrets to eating healthy...', content: 'Full content goes here...', featuredImage: 'https://images.unsplash.com/photo-1498837167922-41c53bbf10f8?q=80&w=2070', views: 150 },
];


async function seed() {
  console.log('Seeding Menu Items with Dynamic Attributes...');

  // Clean existing
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productAttributeOption.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.menuItem.deleteMany();

  for (const item of DEFAULT_MENU_CATALOGUE) {
    let attributes: any[] = [];

    if (item.category === 'North Indian' || item.category === 'Chinese') {
      attributes = [
        {
          name: 'Portion',
          type: 'SINGLE',
          isRequired: true,
          sortOrder: 1,
          options: [
            { name: 'Half', additionalPrice: -(item.price * 0.4), sortOrder: 1 },
            { name: 'Full', additionalPrice: 0, isDefault: true, sortOrder: 2 }
          ]
        },
        {
          name: 'Spice Level',
          type: 'SINGLE',
          isRequired: true,
          sortOrder: 2,
          options: [
            { name: 'Mild', additionalPrice: 0, sortOrder: 1 },
            { name: 'Medium', additionalPrice: 0, isDefault: true, sortOrder: 2 },
            { name: 'Spicy', additionalPrice: 0, sortOrder: 3 }
          ]
        }
      ];
    } else if (item.category === 'Beverages') {
      attributes = [
        {
          name: 'Size',
          type: 'SINGLE',
          isRequired: true,
          sortOrder: 1,
          options: [
            { name: 'Regular', additionalPrice: 0, isDefault: true, sortOrder: 1 },
            { name: 'Large', additionalPrice: 40, sortOrder: 2 }
          ]
        },
        {
          name: 'Add-ons',
          type: 'MULTIPLE',
          isRequired: false,
          sortOrder: 2,
          options: [
            { name: 'Extra Ice Cream', additionalPrice: 30, sortOrder: 1 },
            { name: 'Whipped Cream', additionalPrice: 20, sortOrder: 2 },
            { name: 'Chocolate Syrup', additionalPrice: 15, sortOrder: 3 }
          ]
        }
      ];
    } else if (item.name.includes('Pizza')) {
      attributes = [
        {
          name: 'Size',
          type: 'SINGLE',
          isRequired: true,
          sortOrder: 1,
          options: [
            { name: 'Regular (7")', additionalPrice: 0, isDefault: true, sortOrder: 1 },
            { name: 'Medium (10")', additionalPrice: 150, sortOrder: 2 },
            { name: 'Large (14")', additionalPrice: 300, sortOrder: 3 }
          ]
        },
        {
          name: 'Crust',
          type: 'SINGLE',
          isRequired: true,
          sortOrder: 2,
          options: [
            { name: 'New Hand Tossed', additionalPrice: 0, isDefault: true, sortOrder: 1 },
            { name: 'Cheese Burst', additionalPrice: 99, sortOrder: 2 },
            { name: 'Thin Crust', additionalPrice: 40, sortOrder: 3 }
          ]
        },
        {
          name: 'Toppings',
          type: 'MULTIPLE',
          isRequired: false,
          sortOrder: 3,
          options: [
            { name: 'Extra Cheese', additionalPrice: 50, sortOrder: 1 },
            { name: 'Black Olives', additionalPrice: 30, sortOrder: 2 },
            { name: 'Jalapenos', additionalPrice: 30, sortOrder: 3 }
          ]
        }
      ];
    } else if (item.category === 'Desserts') {
      attributes = [
        {
          name: 'Toppings',
          type: 'MULTIPLE',
          isRequired: false,
          sortOrder: 1,
          options: [
            { name: 'Extra Chocolate Sauce', additionalPrice: 20, sortOrder: 1 },
            { name: 'Vanilla Ice Cream Scoop', additionalPrice: 40, sortOrder: 2 }
          ]
        }
      ];
    }

    await prisma.menuItem.create({
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        diet: item.diet,
        isAvailable: item.isVisible && !item.isOutOfStock,
        attributes: {
          create: attributes.map(attr => ({
            name: attr.name,
            type: attr.type,
            isRequired: attr.isRequired,
            sortOrder: attr.sortOrder,
            options: {
              create: attr.options.map((opt: any) => ({
                name: opt.name,
                additionalPrice: opt.additionalPrice,
                isDefault: opt.isDefault || false,
                sortOrder: opt.sortOrder
              }))
            }
          }))
        }
      }
    });
  }

  console.log('Seeding Roles and Users...');

  const roles = ['SUPER_ADMIN', 'ADMIN', 'PARTNER', 'RIDER', 'CUSTOMER'];
  
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} Role`,
      }
    });
  }

  const permissionNames = [
    'manage_settings',
    'manage_notifications',
    'manage_payments',
    'manage_users',
    'manage_content',
  ];

  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: `Permission: ${name}` },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (adminRole) {
    const permissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
    });
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: adminRole.id, permissionId: permission.id },
      });
    }
  }

  const bcrypt = require('bcrypt');
  const password = await bcrypt.hash('test123', 10); // Standard password for testing

  const users = [
    { email: 'admin@test.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
    { email: 'test@example.com', name: 'Partner User', role: 'PARTNER' }, // Added to match frontend login attempt
    { email: 'partner@test.com', name: 'Partner User 2', role: 'PARTNER' },
    { email: 'rider@test.com', name: 'Rider User', role: 'RIDER' },
    { email: 'customer@test.com', name: 'Customer User', role: 'CUSTOMER' }
  ];

  let index = 1;
  for (const u of users) {
    const roleRecord = await prisma.role.findUnique({ where: { name: u.role } });
    if (roleRecord) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password,
          roleId: roleRecord.id,
          isActive: true
        },
        create: {
          email: u.email,
          name: u.name,
          password,
          roleId: roleRecord.id,
          isActive: true,
          emailVerified: true,
          mobileVerified: true,
          mobile: `+100000000${index++}`
        }
      });
    }
  }

  console.log('Seeding Sliders, Tiffins, Blogs...');
  
  await prisma.portalSlider.deleteMany();
  for (const s of DEFAULT_SLIDERS) {
    await prisma.portalSlider.create({ 
      data: { 
        portal: 'customer', 
        title: s.title, 
        imageUrl: s.imageUrl, 
        link: s.linkUrl || '', 
        isActive: s.isActive,
        description: 'Mock Slider Description',
        buttonText: 'Click Here',
        bgColor: '#ffffff',
        fontColor: '#000000',
        btnColor: '#ff0000'
      } 
    });
  }

  await prisma.tiffinMenu.deleteMany();
  for (const t of DEFAULT_TIFFINS) {
    await prisma.tiffinMenu.create({ data: t });
  }

  await prisma.blog.deleteMany();
  for (const b of DEFAULT_BLOGS) {
    await prisma.blog.create({ data: b });
  }

  console.log('Seeding Orders and Leaves (ApprovalRequests)...');
  const partnerUser = await prisma.user.findFirst({ where: { email: 'test@example.com' } });
  const riderUser = await prisma.user.findFirst({ where: { email: 'rider@test.com' } });
  const customerUser = await prisma.user.findFirst({ where: { email: 'customer@test.com' } });

  if (partnerUser && riderUser && customerUser) {
    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'One Choice Kitchen (Main)',
          email: 'partner@test.com',
          isActive: true
        }
      });
    }

    await prisma.order.deleteMany();
    await prisma.order.create({
      data: {
        userId: customerUser.id,
        restaurantId: restaurant.id,
        status: 'PREPARING',
        totalAmount: 350,
        deliveryFee: 40,
        paymentStatus: 'PAID',
        paymentMethod: 'ONLINE',
        deliveryAddress: '123 Test St, City',
        deliveryLat: 28.7041,
        deliveryLng: 77.1025,
        items: {
          create: [
            { menuItemId: 'item-1', quantity: 1, price: 260 },
          ]
        }
      }
    });

    await prisma.approvalRequest.deleteMany();
    await prisma.approvalRequest.create({
      data: {
        entityType: 'LEAVE',
        requestedData: JSON.stringify({ type: 'SICK', reason: 'Not feeling well', startDate: '2026-06-15', endDate: '2026-06-16' }),
        status: 'PENDING',
        requestedById: riderUser.id,
      }
    });
  }

  console.log('Seeded successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
