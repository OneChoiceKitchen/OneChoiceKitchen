const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('apps/admin/admin-portal/src/app/pages');
let updatedCount = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const initialContent = content;
  
  // Replace remaining `.json()` cases (like ordersRes.json())
  content = content.replace(/([a-zA-Z0-9_]+)\.json\(\)/g, '$1.text().then(t => JSON.parse(t))');
  
  if (file.includes('DashboardAdmin.tsx')) {
     content = content.split('<ResponsiveContainer width="100%" height="100%">').join('<ResponsiveContainer width="100%" height={300}>');
  }

  if (content !== initialContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
  }
}
console.log('Fixed', updatedCount, 'files');
