const fs = require('fs');
const file = 'apps/admin/admin-portal/src/app/pages/BranchesAdmin.tsx';
let c = fs.readFileSync(file, 'utf8');

// Extract the initial state object
const match = c.match(/const \[form, setForm\] = useState\((\{[\s\S]*?\})\);/);
if (match) {
  const initialStateStr = match[1];
  
  // Replace all other hardcoded setForm({ ... }) that look like reset
  c = c.replace(/setForm\(\{\s*restaurantId: '',\s*name: '',[\s\S]*?\}\);/g, `setForm(${initialStateStr});`);
  fs.writeFileSync(file, c);
  console.log('Fixed BranchesAdmin state resets');
} else {
  console.log('Could not find initial state');
}
