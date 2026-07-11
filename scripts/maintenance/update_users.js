const fs = require('fs');
const file = 'apps/admin/admin-portal/src/app/pages/UsersAdmin.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert a title and description before the tabs
const anchor = '<div className={styles.tabControls}>';
if (content.includes(anchor)) {
    const replacement = `
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Manage Customers</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your customers, admins, partners, and riders across the platform.</p>
          </div>
          ` + anchor;
    content = content.replace(anchor, replacement);
    fs.writeFileSync(file, content, 'utf8');
}
