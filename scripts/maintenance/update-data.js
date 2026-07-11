const fs = require('fs');
let content = fs.readFileSync('apps/web/app/data.ts', 'utf8');
content = content.replace(/diet:\s*'([^']+)',\s*image:\s*('[^']+'|null)\s*\}/g, "diet: '$1', image: $2, isVisible: true, isOutOfStock: false }");
fs.writeFileSync('apps/web/app/data.ts', content);
