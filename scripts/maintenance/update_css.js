const fs = require('fs');

// 1. GroupDashboard Margin in app.tsx
const appTsx = 'apps/admin/admin-portal/src/app/app.tsx';
let appContent = fs.readFileSync(appTsx, 'utf8');
appContent = appContent.replace("marginTop: '2rem'", "marginTop: '1rem'");
fs.writeFileSync(appTsx, appContent, 'utf8');

// 2. Reduce padding in pageHeader and contentArea
const appCss = 'apps/admin/admin-portal/src/app/app.module.css';
let cssContent = fs.readFileSync(appCss, 'utf8');
cssContent = cssContent.replace(
  /\.pageHeader \{\s*display: flex;\s*justify-content: space-between;\s*align-items: center;\s*margin-bottom: 2rem;\s*\}/,
  `.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}`
);
cssContent = cssContent.replace(
  /\.pageContainer \{\s*padding: 2rem;\s*\}/,
  `.pageContainer {
  padding: 1rem 2rem;
}`
);
fs.writeFileSync(appCss, cssContent, 'utf8');
