import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') });
const prisma = new PrismaClient({ adapter });

import * as bcrypt from 'bcrypt';
const ALL_PERMISSIONS = [
  'manage_dashboard', 'manage_branches', 'manage_menus', 'manage_tiffin', 'manage_tables', 
  'manage_reservations', 'manage_waitlist', 'manage_users', 'manage_inventory', 'manage_offers', 
  'manage_rewards', 'manage_referrals', 'manage_reviews', 'manage_sliders', 'manage_blogs', 
  'manage_comments', 'manage_seo', 'manage_pages', 'manage_orders', 'manage_payouts', 
  'manage_refunds', 'manage_surge_pricing', 'manage_corporate', 'manage_hrms', 'manage_leaves', 
  'manage_support', 'manage_compliance', 'manage_audit_logs', 'manage_roles', 'manage_whatsapp_config', 
  'manage_templates', 'manage_maps_config', 'manage_email_config', 'manage_sms_config', 'manage_service_providers', 
  'manage_delivery_settings', 'manage_sla_config', 'manage_payment_config', 'manage_settings'
];

const ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full access to all modules',
    permissions: ALL_PERMISSIONS,
    user: { email: 'superadmin@test.com', name: 'Super Admin' }
  },
  {
    name: 'MANAGER',
    description: 'Can manage core operations and finances',
    permissions: ['manage_dashboard', 'manage_branches', 'manage_menus', 'manage_tiffin', 'manage_tables', 'manage_reservations', 'manage_waitlist', 'manage_inventory', 'manage_orders', 'manage_payouts', 'manage_refunds'],
    user: { email: 'manager@test.com', name: 'Restaurant Manager' }
  },
  {
    name: 'MARKETING_ADMIN',
    description: 'Manages marketing, SEO, and CMS',
    permissions: ['manage_dashboard', 'manage_offers', 'manage_rewards', 'manage_referrals', 'manage_reviews', 'manage_sliders', 'manage_blogs', 'manage_comments', 'manage_seo', 'manage_pages'],
    user: { email: 'marketing@test.com', name: 'Marketing Admin' }
  },
  {
    name: 'HR_ADMIN',
    description: 'Manages HRMS and staff',
    permissions: ['manage_dashboard', 'manage_hrms', 'manage_leaves', 'manage_users'],
    user: { email: 'hr@test.com', name: 'HR Admin' }
  },
  {
    name: 'SUPPORT_ADMIN',
    description: 'Handles support and compliance',
    permissions: ['manage_dashboard', 'manage_support', 'manage_compliance', 'manage_audit_logs', 'manage_reviews'],
    user: { email: 'support@test.com', name: 'Support Admin' }
  }
];

async function main() {
  console.log('Starting Roles & Permissions Seed...');

  // 1. Create all permissions
  for (const p of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, description: `Permission to ${p.replace('_', ' ')}` }
    });
  }
  console.log('Created all permissions.');

  const passwordHash = await bcrypt.hash('test123', 10);

  // 2. Create roles, link permissions, and create users
  for (const roleDef of ROLES) {
    console.log(`Setting up role: ${roleDef.name}`);
    
    // Create or update role
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description }
    });

    // Link permissions
    // First remove old ones just in case
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    
    const permRecords = await prisma.permission.findMany({
      where: { name: { in: roleDef.permissions } }
    });

    for (const pr of permRecords) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: pr.id
        }
      });
    }

    // Create user account
    await prisma.user.upsert({
      where: { email: roleDef.user.email },
      update: {
        roleId: role.id,
        password: passwordHash
      },
      create: {
        email: roleDef.user.email,
        password: passwordHash,
        name: roleDef.user.name,
        roleId: role.id
      }
    });

    console.log(`Created account ${roleDef.user.email} for role ${roleDef.name}`);
  }

  console.log('Roles & Permissions Seed Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
