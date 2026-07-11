const fs = require('fs');
const file = 'apps/admin/admin-portal/src/app/app.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert Profile & Preferences into Routes
const routeAnchor = '<Route path="/group/:groupId" element={<GroupDashboard />} />';
if (content.includes(routeAnchor) && !content.includes('path="/profile"')) {
    const replacement = routeAnchor + '\n              <Route path="/profile" element={<MyProfileAdmin />} />\n              <Route path="/preferences" element={<PreferencesAdmin />} />';
    content = content.replace(routeAnchor, replacement);
}

fs.writeFileSync(file, content, 'utf8');
