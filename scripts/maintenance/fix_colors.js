const fs = require('fs');
let code = fs.readFileSync('apps/admin/admin-portal/src/app/app.tsx', 'utf8');

const colors = [
  '{ background: "rgba(0,84,166,0.1)", color: "#0054A6" }',
  '{ background: "rgba(16,185,129,0.1)", color: "#10B981" }',
  '{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }',
  '{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }',
  '{ background: "rgba(236,72,153,0.1)", color: "#EC4899" }',
  '{ background: "rgba(6,182,212,0.1)", color: "#06B6D4" }',
  '{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }',
  '{ background: "rgba(244,63,94,0.1)", color: "#F43F5E" }'
];

code = code.replace(
  /<div\n                className=\{styles\.moduleIcon\}\n                style=\{\{ background: 'rgba\(0,84,166,0\.1\)', color: '#0054A6' \}\}\n              >/g,
  `<div
                className={styles.moduleIcon}
                style={[${colors.join(', ')}][SIDEBAR_CONFIG.findIndex(g => g.id === group.id) % 8]}
              >`
);

fs.writeFileSync('apps/admin/admin-portal/src/app/app.tsx', code);
console.log('Colors replaced successfully.');
