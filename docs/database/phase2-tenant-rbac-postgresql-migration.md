# Phase 2 Tenant/RBAC PostgreSQL Migration

This migration must be generated and tested against the PostgreSQL Prisma configuration and a copy of production data. The repository's current `schema.prisma` uses SQLite and there is no local `prisma/migrations` baseline, so do not generate or apply the production migration from that SQLite configuration.

## 1. Create the draft only

The requested command is:

```bash
npx prisma migrate dev --create-only --name phase2_tenant_rbac
```

The workspace-standard, version-pinned equivalent is preferred:

```bash
pnpm exec prisma migrate dev --create-only --name phase2_tenant_rbac
```

Run this only in development with the PostgreSQL `DATABASE_URL`. Never run `migrate dev` against staging or production.

## 2. Inspect actual PostgreSQL object names

Run these read-only queries before editing the draft. If names differ from the defaults below, update the rename statements to match the real database.

```sql
SELECT c.relname AS table_name, con.conname AS constraint_name, con.contype
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('User', 'Role', 'Permission', 'Employee')
ORDER BY c.relname, con.conname;

SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Role', 'Permission', 'Employee')
ORDER BY tablename, indexname;
```

## 3. Replace destructive table operations

Place the following block before the generated creation of the genuinely new Phase 2 tables:

```sql
-- Preserve all existing rows and dependent relationships.
ALTER TABLE "public"."User"       RENAME TO "cat_customers";
ALTER TABLE "public"."Role"       RENAME TO "cat_roles";
ALTER TABLE "public"."Permission" RENAME TO "cat_permissions";
ALTER TABLE "public"."Employee"   RENAME TO "cat_hrms";

-- Align primary-key constraint names with Prisma's mapped table names.
-- PostgreSQL also renames the backing primary-key indexes.
ALTER TABLE "public"."cat_customers"
  RENAME CONSTRAINT "User_pkey" TO "cat_customers_pkey";
ALTER TABLE "public"."cat_roles"
  RENAME CONSTRAINT "Role_pkey" TO "cat_roles_pkey";
ALTER TABLE "public"."cat_permissions"
  RENAME CONSTRAINT "Permission_pkey" TO "cat_permissions_pkey";
ALTER TABLE "public"."cat_hrms"
  RENAME CONSTRAINT "Employee_pkey" TO "cat_hrms_pkey";

-- Prisma @unique fields are normally standalone unique indexes.
ALTER INDEX "public"."User_email_key"
  RENAME TO "cat_customers_email_key";
ALTER INDEX "public"."User_mobile_key"
  RENAME TO "cat_customers_mobile_key";
ALTER INDEX "public"."User_googleId_key"
  RENAME TO "cat_customers_googleId_key";
ALTER INDEX "public"."User_facebookId_key"
  RENAME TO "cat_customers_facebookId_key";
ALTER INDEX "public"."User_referralCode_key"
  RENAME TO "cat_customers_referralCode_key";

ALTER INDEX "public"."Role_name_key"
  RENAME TO "cat_roles_name_key";

ALTER INDEX "public"."Permission_name_key"
  RENAME TO "cat_permissions_name_key";

ALTER INDEX "public"."Employee_userId_key"
  RENAME TO "cat_hrms_userId_key";
ALTER INDEX "public"."Employee_email_key"
  RENAME TO "cat_hrms_email_key";

-- Foreign keys owned by User retain their old names after a table rename.
ALTER TABLE "public"."cat_customers"
  RENAME CONSTRAINT "User_roleId_fkey"
  TO "cat_customers_roleId_fkey";
ALTER TABLE "public"."cat_customers"
  RENAME CONSTRAINT "User_restaurantId_fkey"
  TO "cat_customers_restaurantId_fkey";
```

The table renames preserve incoming foreign keys automatically. For example, constraints owned by `Address`, `RolePermission`, `Shift`, and other referencing tables continue to point to the renamed tables and must not be dropped.

## 4. Required manual review of the generated draft

Do not only prepend the rename block. In the same generated `migration.sql`:

1. Remove every generated `DROP TABLE` and `CREATE TABLE` for `User`, `Role`, `Permission`, `Employee`, `cat_customers`, `cat_roles`, `cat_permissions`, and `cat_hrms` that represents a rename rather than a genuinely new table.
2. Remove generated drops/recreations of the existing rows' indexes and foreign keys.
3. Keep the `CREATE TABLE` statements for genuinely new models such as `cat_tenants`, `cat_tenant_branches`, portal memberships, and role assignments.
4. Convert genuine new fields on renamed tables into `ALTER TABLE ... ADD COLUMN` statements. Phase 2 examples include nullable `tenantId` on `cat_hrms`, nullable `tenantId` and the new RBAC columns on `cat_roles`, and nullable permission metadata on `cat_permissions`.
5. Add new foreign keys only after their referenced new tables have been created.
6. Wrap the complete migration in `BEGIN;` and `COMMIT;` so a failure rolls back the entire change.
7. Confirm that the final migration contains no data-copying `INSERT ... SELECT`, `DROP TABLE`, or table recreation for the four renamed tables.

## 5. Verification and deployment

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

Run `migrate deploy` first against a restored production snapshot. Verify row counts before and after:

```sql
SELECT COUNT(*) FROM "public"."cat_customers";
SELECT COUNT(*) FROM "public"."cat_roles";
SELECT COUNT(*) FROM "public"."cat_permissions";
SELECT COUNT(*) FROM "public"."cat_hrms";
```

Then run API authentication, Admin user management, Partner login, Rider login, HRMS, and role-permission integration tests.

## Rollback SQL

Only use rollback after removing or reversing any new foreign keys that depend on Phase 2 tables:

```sql
ALTER TABLE "public"."cat_customers"  RENAME TO "User";
ALTER TABLE "public"."cat_roles"      RENAME TO "Role";
ALTER TABLE "public"."cat_permissions" RENAME TO "Permission";
ALTER TABLE "public"."cat_hrms"       RENAME TO "Employee";
```

Restore from the pre-migration PostgreSQL snapshot if any data validation fails.
