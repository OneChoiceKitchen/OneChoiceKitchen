import sys

with open('prisma/schema.prisma', 'r') as f:
    lines = f.readlines()

idx = -1
for i, line in enumerate(lines):
    if 'model SeoMetadata {' in line:
        idx = i
        break

if idx == -1:
    print('Could not find SeoMetadata')
    sys.exit(1)

good_lines = lines[:idx]

with open('prisma/schema.prisma', 'w') as f:
    f.writelines(good_lines)
    f.write('model SeoMetadata {\n')
    f.write('  id               String   @id @default(uuid())\n')
    f.write('  pageName         String   @unique // e.g. "home", "about", "menu"\n')
    f.write('  title            String\n')
    f.write('  description      String?\n')
    f.write('  keywords         String?\n')
    f.write('  canonicalUrl     String?\n')
    f.write('  robots           String   @default("index, follow")\n')
    f.write('  ogTitle          String?\n')
    f.write('  ogDescription    String?\n')
    f.write('  ogImageUrl       String?\n')
    f.write('  ogUrl            String?\n')
    f.write('  twitterTitle     String?\n')
    f.write('  twitterDescription String?\n')
    f.write('  twitterImageUrl  String?\n')
    f.write('  schemaMarkup     String?  // JSON string for LD-JSON\n')
    f.write('  updatedAt        DateTime @updatedAt\n')
    f.write('}\n\n')
    f.write('// ==========================================\n')
    f.write('// DYNAMIC MENU ITEMS & ATTRIBUTES\n')
    f.write('// ==========================================\n\n')
    f.write('model MenuItem {\n')
    f.write('  id            String             @id @default(uuid())\n')
    f.write('  name          String\n')
    f.write('  description   String?\n')
    f.write('  price         Float\n')
    f.write('  image         String?\n')
    f.write('  diet          String             @default("VEG") // VEG, NON-VEG\n')
    f.write('  category      String             @default("Main")\n')
    f.write('  isAvailable   Boolean            @default(true)\n')
    f.write('  createdAt     DateTime           @default(now())\n')
    f.write('  updatedAt     DateTime           @updatedAt\n')
    f.write('  attributes    ProductAttribute[]\n')
    f.write('}\n\n')
    f.write('model ProductAttribute {\n')
    f.write('  id          String                   @id @default(uuid())\n')
    f.write('  menuItemId  String\n')
    f.write('  menuItem    MenuItem                 @relation(fields: [menuItemId], references: [id], onDelete: Cascade)\n')
    f.write('  name        String                   // e.g. "Size", "Spice Level", "Add-ons"\n')
    f.write('  type        String                   @default("SINGLE") // SINGLE, MULTIPLE\n')
    f.write('  isRequired  Boolean                  @default(false)\n')
    f.write('  sortOrder   Int                      @default(0)\n')
    f.write('  options     ProductAttributeOption[]\n')
    f.write('  createdAt   DateTime                 @default(now())\n')
    f.write('  updatedAt   DateTime                 @updatedAt\n')
    f.write('}\n\n')
    f.write('model ProductAttributeOption {\n')
    f.write('  id              String           @id @default(uuid())\n')
    f.write('  attributeId     String\n')
    f.write('  attribute       ProductAttribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)\n')
    f.write('  name            String           // e.g. "Small", "Large", "Extra Cheese"\n')
    f.write('  additionalPrice Float            @default(0)\n')
    f.write('  isDefault       Boolean          @default(false)\n')
    f.write('  isAvailable     Boolean          @default(true)\n')
    f.write('  sortOrder       Int              @default(0)\n')
    f.write('  createdAt       DateTime         @default(now())\n')
    f.write('  updatedAt       DateTime         @updatedAt\n')
    f.write('}\n')
