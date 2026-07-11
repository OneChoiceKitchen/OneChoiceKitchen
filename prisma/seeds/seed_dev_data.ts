/**
 * seed_dev_data.ts — OneChoiceKitchen Development Seed
 * Seeds realistic Bengaluru-based data for local development and testing.
 *
 * GUARD: If data already exists (restaurant + branches found), seed is SKIPPED.
 *        This protects user-created data from being overwritten.
 *        To force re-seed: pass --force flag.
 *
 * Run via: pnpm exec ts-node prisma/seeds/seed_dev_data.ts
 * Auto-invoked by setup_local.ps1 after prisma db push.
 * Uses deterministic IDs so upsert is always idempotent.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';
const FORCE = process.argv.includes('--force');

const dbPath = join(process.cwd(), 'dev.db');   // root dev.db — this is what the API uses
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma  = new PrismaClient({ adapter } as any);


const RESTAURANT_ID = 'seed-restaurant-onechoicekitchen';
const SUPPLIER_ID   = 'seed-supplier-fresh-market';

async function main() {
  console.log('[SEED-DEV] Starting...');

  // ── GUARD: skip if user already has their own data ──────────────────────────
  if (!FORCE) {
    const existingCount = await prisma.restaurant.count({ where: { isDeleted: false } });
    if (existingCount > 0) {
      const own = await prisma.restaurant.findUnique({ where: { id: RESTAURANT_ID } });
      if (!own) {
        console.log(`[SEED-DEV] ${existingCount} restaurant(s) already exist (user data). Skipping to protect your data.`);
        console.log('[SEED-DEV] To force re-seed anyway: pnpm exec ts-node prisma/seeds/seed_dev_data.ts --force');
        return;
      }
    }
  }

  // ── RESTAURANT ──────────────────────────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where:  { id: RESTAURANT_ID },
    update: {},
    create: {
      id:        RESTAURANT_ID,
      name:      'One Choice Kitchen',
      ownerName: 'Rakshakar Iyer',
      email:     'admin@onechoicekitchen.in',
      mobile:    '9876543210',
      address:   'Bengaluru, Karnataka',
      city:      'Bengaluru',
      isActive:  true,
    },
  });
  console.log('[SEED-DEV] Restaurant:', restaurant.name);

  // ── BRANCHES ────────────────────────────────────────────────────────────────
  const branchDefs = [
    {
      id: 'seed-branch-mg-road',
      name: 'MG Road - Bengaluru', address: '42, Brigade Road, MG Road',
      city: 'Bengaluru', phone: '+91 80 4567 8901', email: 'mgroad@onechoicekitchen.in',
      lat: 12.9716, lng: 77.5946, isActive: true, isQrMenuEnabled: true,
      isReservationEnabled: true, isDeliveryEnabled: true, isTakeawayEnabled: true,
      mondayHours:'08:00-22:00', tuesdayHours:'08:00-22:00', wednesdayHours:'08:00-22:00',
      thursdayHours:'08:00-22:00', fridayHours:'08:00-23:00', saturdayHours:'08:00-23:00', sundayHours:'09:00-21:00',
      fssaiNumber:'FBO-KA-12345678', gstNumber:'29AAAAA0000A1Z5', panNumber:'AAAAA0000A',
    },
    {
      id: 'seed-branch-koramangala',
      name: 'Koramangala - Bengaluru', address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru', phone: '+91 80 2345 6789', email: 'koramangala@onechoicekitchen.in',
      lat: 12.9352, lng: 77.6245, isActive: true, isQrMenuEnabled: true,
      isReservationEnabled: false, isDeliveryEnabled: true, isTakeawayEnabled: true,
      mondayHours:'08:00-21:00', tuesdayHours:'08:00-21:00', wednesdayHours:'08:00-21:00',
      thursdayHours:'08:00-21:00', fridayHours:'08:00-22:00', saturdayHours:'08:00-22:00', sundayHours:'09:00-20:00',
      fssaiNumber:'FBO-KA-87654321', gstNumber:'29BBBBB1111B1Z6', panNumber:'BBBBB1111B',
    },
    {
      id: 'seed-branch-indiranagar',
      name: 'Indiranagar - Bengaluru', address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru', phone: '+91 80 3456 7890', email: 'indiranagar@onechoicekitchen.in',
      lat: 12.9719, lng: 77.6412, isActive: false, isQrMenuEnabled: false,
      isReservationEnabled: true, isDeliveryEnabled: false, isTakeawayEnabled: true,
      mondayHours:'08:00-22:00', tuesdayHours:'08:00-22:00', wednesdayHours:'08:00-22:00',
      thursdayHours:'08:00-22:00', fridayHours:'08:00-23:00', saturdayHours:'09:00-23:00', sundayHours:'09:00-21:00',
      fssaiNumber:'FBO-KA-11223344', gstNumber:'29CCCCC2222C1Z7', panNumber:'CCCCC2222C',
    },
  ];

  for (const b of branchDefs) {
    await prisma.restaurantBranch.upsert({
      where:  { id: b.id },
      update: { isActive: b.isActive, phone: b.phone },
      create: { restaurantId: restaurant.id, ...b },
    });
    console.log('[SEED-DEV] Branch:', b.name);
  }

  // ── SUPPLIER ────────────────────────────────────────────────────────────────
  await prisma.supplier.upsert({
    where:  { id: SUPPLIER_ID },
    update: {},
    create: { id: SUPPLIER_ID, name: 'Fresh Market Supplies', contact: '+91 98765 00001', email: 'orders@freshmarket.in' },
  });

  // ── INVENTORY ───────────────────────────────────────────────────────────────
  const inventoryItems = [
    { sku:'GRN-001', name:'Basmati Rice (Premium)',     quantity:50,  threshold:10, warehouse:'Main Kitchen'  },
    { sku:'GRN-002', name:'Whole Wheat Flour',          quantity:8,   threshold:10, warehouse:'Main Kitchen'  },
    { sku:'GRN-003', name:'Dosa Rice Batter',           quantity:25,  threshold:5,  warehouse:'Main Kitchen'  },
    { sku:'DAI-001', name:'Full Cream Milk',            quantity:0,   threshold:5,  warehouse:'Cold Storage'  },
    { sku:'DAI-002', name:'Paneer (Fresh)',             quantity:12,  threshold:3,  warehouse:'Cold Storage'  },
    { sku:'VEG-001', name:'Tomatoes',                   quantity:20,  threshold:5,  warehouse:'Dry Store'     },
    { sku:'VEG-002', name:'Onions',                     quantity:30,  threshold:8,  warehouse:'Dry Store'     },
    { sku:'OIL-001', name:'Refined Sunflower Oil',      quantity:18,  threshold:5,  warehouse:'Main Kitchen'  },
    { sku:'OIL-002', name:'Cold Press Coconut Oil',     quantity:3,   threshold:5,  warehouse:'Main Kitchen'  },
    { sku:'SPC-001', name:'Cumin Seeds (Jeera)',         quantity:2,   threshold:1,  warehouse:'Spice Rack'    },
    { sku:'SPC-002', name:'Turmeric Powder',            quantity:4,   threshold:1,  warehouse:'Spice Rack'    },
    { sku:'PRO-001', name:'Yellow Lentils (Moong Dal)', quantity:15,  threshold:5,  warehouse:'Dry Store'     },
    { sku:'BEV-001', name:'Tea Leaves (Assam)',         quantity:6,   threshold:2,  warehouse:'Dry Store'     },
    { sku:'PKG-001', name:'Kraft Paper Boxes (Medium)', quantity:200, threshold:50, warehouse:'Packing Area'  },
    { sku:'PKG-002', name:'Biryani Containers (1L)',    quantity:120, threshold:30, warehouse:'Packing Area'  },
  ];
  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where:  { sku: item.sku },
      update: { quantity: item.quantity, threshold: item.threshold },
      create: { ...item, supplierId: SUPPLIER_ID },
    });
    console.log('[SEED-DEV] Inventory:', item.sku, item.name);
  }

  // ── MENU ITEMS ──────────────────────────────────────────────────────────────
  const menuItems = [
    { name:'Masala Dosa',          description:'Crispy rice crepe with spiced potato filling, sambar and chutneys.', price:120, category:'Breakfast',   diet:'VEG',     prepTime:12, isPopular:true  },
    { name:'Idli Plate (4 pcs)',   description:'Steamed rice cakes with sambar and coconut chutney.',               price:80,  category:'Breakfast',   diet:'VEG',     prepTime:8,  isPopular:true  },
    { name:'Paneer Butter Masala', description:'Cottage cheese in rich tomato-butter gravy.',                       price:220, category:'Main Course', diet:'VEG',     prepTime:20, isPopular:true  },
    { name:'Dal Tadka',            description:'Yellow lentils tempered with cumin, garlic and butter.',            price:160, category:'Main Course', diet:'VEG',     prepTime:25, isPopular:false },
    { name:'Veg Biryani',          description:'Fragrant basmati rice cooked with seasonal vegetables.',            price:180, category:'Rice',        diet:'VEG',     prepTime:35, isPopular:true  },
    { name:'Chapati (2 pcs)',      description:'Soft whole wheat flatbreads.',                                      price:40,  category:'Breads',      diet:'VEG',     prepTime:8,  isPopular:false },
    { name:'Masala Chai',          description:'Spiced milk tea with ginger and cardamom.',                        price:30,  category:'Beverages',   diet:'VEG',     prepTime:5,  isPopular:true  },
    { name:'Curd Rice',            description:'Cooling yogurt rice tempered with mustard seeds.',                  price:90,  category:'Rice',        diet:'VEG',     prepTime:10, isPopular:false },
  ];
  for (const item of menuItems) {
    const exists = await prisma.menuItem.findFirst({
      where: { name: item.name, restaurantId: restaurant.id },
    });
    if (!exists) {
      await prisma.menuItem.create({
        data: { ...item, restaurantId: restaurant.id, branchId: 'seed-branch-mg-road' },
      });
      console.log('[SEED-DEV] MenuItem:', item.name);
    } else {
      console.log('[SEED-DEV] MenuItem already exists (skip):', item.name);
    }
  }

  console.log('[SEED-DEV] ✅ Done. All dev data seeded successfully.');
  console.log('[SEED-DEV] Open Admin Portal → Restaurant Operations to see the data.');
}

main()
  .catch(e => { console.error('[SEED-DEV] ❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
