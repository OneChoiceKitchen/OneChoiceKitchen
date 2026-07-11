const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'api', 'src');
const files = [
  'partners/partners.service.spec.ts',
  'orders/orders.service.spec.ts',
  'riders/riders.service.spec.ts',
  'users/users.service.spec.ts',
  'riders/riders.controller.spec.ts',
  'partners/partners.controller.spec.ts',
  'orders/orders.controller.spec.ts',
  'users/users.controller.spec.ts',
];

for (const file of files) {
  const fullPath = path.join(baseDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import for PrismaService if missing
    if (!content.includes('PrismaService')) {
      content = "import { PrismaService } from '../prisma/prisma.service';\n" + content;
    }
    
    // Patch providers
    content = content.replace(/providers:\s*\[([a-zA-Z]+)\],/, "providers: [$1, { provide: PrismaService, useValue: {} }],");
    
    fs.writeFileSync(fullPath, content);
    console.log('Patched', file);
  } else {
    console.log('Not found', file);
  }
}
