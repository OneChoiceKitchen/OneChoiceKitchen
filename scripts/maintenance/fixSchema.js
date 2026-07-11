const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Fix id String @id to id String @id @default(uuid())
// But only if it doesn't already have @default
schema = schema.replace(/id\s+String\s+@id\s*$/gm, 'id String @id @default(uuid())');

// Fix updatedAt DateTime to updatedAt DateTime @updatedAt
// But only if it doesn't already have @updatedAt
schema = schema.replace(/updatedAt\s+DateTime\s*$/gm, 'updatedAt DateTime @updatedAt');

fs.writeFileSync(schemaPath, schema);
console.log('Fixed schema.prisma');
