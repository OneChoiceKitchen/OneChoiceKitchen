/**
 * seed_prod_data.ts — OneChoiceKitchen Production Seed
 * Seeds MINIMAL baseline data required for production to be operational.
 * Only seeds data that MUST exist (admin user, restaurant record, compliance defaults).
 * Does NOT seed test/dev data like fake branches, pricing, or bulk inventory.
 *
 * Run via: npx ts-node prisma/seeds/seed_prod_data.ts
 * Auto-invoked by setup_deployment.ps1 after migrations.
 *
 * Uses upsert (idempotent) — safe to re-run.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('[SEED-PROD] Starting production seed...');

  // ─── ADMIN USER ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@onechoicekitchen.in';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      role: 'SUPER_ADMIN',
      // Password should be set via env var — DO NOT hardcode
      passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$placeholder_change_before_launch',
    },
  }).catch(() => {
    console.log('[SEED-PROD] user model not found or different schema — skipping admin user');
    return null;
  });
  if (adminUser) console.log('[SEED-PROD] Admin user:', adminEmail);

  // ─── RESTAURANT ────────────────────────────────────────────────────────────
  const restaurantEmail = process.env.RESTAURANT_EMAIL || adminEmail;
  const restaurant = await prisma.restaurant.upsert({
    where: { email: restaurantEmail },
    update: {},
    create: {
      name: process.env.RESTAURANT_NAME || 'One Choice Kitchen',
      ownerName: process.env.OWNER_NAME || 'Administrator',
      email: restaurantEmail,
      mobile: process.env.OWNER_MOBILE || '9999999999',
    },
  });
  console.log('[SEED-PROD] Restaurant:', restaurant.id);

  // ─── DEFAULT SUPPLIER ──────────────────────────────────────────────────────
  await prisma.supplier.upsert({
    where: { id: 'prod-supplier-default' },
    update: {},
    create: {
      id: 'prod-supplier-default',
      name: 'Default Supplier',
      contact: process.env.DEFAULT_SUPPLIER_CONTACT || '+91 99999 00000',
      email: process.env.DEFAULT_SUPPLIER_EMAIL || 'supplier@onechoicekitchen.in',
    },
  });
  console.log('[SEED-PROD] Default supplier created.');

  // ─── ESSENTIAL INVENTORY CATEGORIES (empty stock, correct SKUs) ────────────
  // These are seeded so the SKU structure exists; actual quantities set by ops team.
  const skeletonInventory = [
    { sku: 'GRN-001', name: 'Basmati Rice (Premium)',     quantity: 0, threshold: 10, warehouse: 'Main Kitchen' },
    { sku: 'DAI-001', name: 'Full Cream Milk',            quantity: 0, threshold: 5,  warehouse: 'Cold Storage' },
    { sku: 'OIL-001', name: 'Refined Sunflower Oil',      quantity: 0, threshold: 5,  warehouse: 'Main Kitchen' },
    { sku: 'PKG-001', name: 'Kraft Paper Boxes (Medium)', quantity: 0, threshold: 50, warehouse: 'Packing Area' },
  ];

  for (const item of skeletonInventory) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: { ...item, supplierId: 'prod-supplier-default' },
    });
  }
  console.log('[SEED-PROD] Skeleton inventory structure created.');

  console.log('[SEED-PROD] Production seed complete. Update real quantities via Admin Portal.');
}

main().catch(e => { console.error('[SEED-PROD] Error:', e); process.exit(1); })
      .finally(() => prisma.$disconnect());
