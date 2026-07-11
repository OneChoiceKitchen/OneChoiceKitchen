const fs = require('fs');
const file = 'apps/admin/admin-portal/src/app/app.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Breadcrumb icon fix
content = content.replace(/transform: 'scale\(0\.8\)'/g, "transform: 'scale(0.8)', display: 'inline-flex', alignItems: 'center'");

// 2. Profile and Preferences routes
const routeAnchor = '<Route path="/group/:groupId" element={<GroupDashboard />} />';
if (content.includes(routeAnchor) && !content.includes('path="/profile"')) {
    content = content.replace(routeAnchor, routeAnchor + '\n              <Route path="/profile" element={<MyProfileAdmin />} />\n              <Route path="/preferences" element={<PreferencesAdmin />} />');
}

// 3. GroupDashboard margin
content = content.replace(/marginTop: '2rem'/g, "marginTop: '1rem'");

// 4. Quick Create clicks
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Order'\}\)/g, "navigate('/orders?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Customer'\}\)/g, "navigate('/users?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Branch'\}\)/g, "navigate('/branches?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Menu Item'\}\)/g, "navigate('/menus?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Employee'\}\)/g, "navigate('/users?action=new_employee')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Reservation'\}\)/g, "navigate('/reservations?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Offer'\}\)/g, "navigate('/offers?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Task'\}\)/g, "navigate('/tasks?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Campaign'\}\)/g, "navigate('/marketing-dashboard?action=new')");

// 5. Remove QUICK CREATE MODAL body, keeping the div if it wraps anything else?
// Wait, the modal is wrapped in {quickCreateOpen.isOpen && ( <div className={styles.searchModalOverlay}...> )}
// I can just replace the entire condition with an empty string.
const modalStart = content.indexOf('{quickCreateOpen.isOpen && (');
if (modalStart !== -1) {
    // Find the closing )} of the modal
    // It's just before {/* STICKY FOOTER */}
    const stickyFooterIndex = content.indexOf('{/* STICKY FOOTER */}');
    if (stickyFooterIndex !== -1) {
        // Find the last ')}' before STICKY FOOTER
        const partBeforeFooter = content.substring(0, stickyFooterIndex);
        const lastClosingIndex = partBeforeFooter.lastIndexOf(')}');
        if (lastClosingIndex > modalStart) {
            content = content.substring(0, modalStart) + content.substring(lastClosingIndex + 2);
        }
    }
}

fs.writeFileSync(file, content, 'utf8');
