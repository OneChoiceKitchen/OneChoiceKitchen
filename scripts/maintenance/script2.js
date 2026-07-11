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
  
  // Example matches:
  // if (response.ok) {
  //   const data = await res.text()
  //
  // response.ok ? await res.text()
  // 
  // Let's find all instances of 'await res.text()'
  // And try to replace 'res' with the variable from the nearest '.ok' check before it.
  
  const parts = content.split('res.text().then');
  if (parts.length > 1) {
      let newContent = parts[0];
      for (let i = 1; i < parts.length; i++) {
          // look back in newContent for the nearest `.ok`
          const match = [...newContent.matchAll(/([a-zA-Z0-9_]+)\.ok/g)].pop();
          if (match && match[1] !== 'res') {
              newContent += match[1] + '.text().then' + parts[i];
          } else {
              newContent += 'res.text().then' + parts[i];
          }
      }
      content = newContent;
  }
  
  if (content !== initialContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
  }
}
console.log('Fixed', updatedCount, 'files');
