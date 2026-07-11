const fs = require('fs');
const file = 'apps/admin/admin-portal/src/app/app.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the Quick Create Dropdown clicks
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Order'\}\)/g, "navigate('/orders?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Customer'\}\)/g, "navigate('/users?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Branch'\}\)/g, "navigate('/branches?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Menu Item'\}\)/g, "navigate('/menus?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Employee'\}\)/g, "navigate('/users?action=new_employee')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Reservation'\}\)/g, "navigate('/reservations?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Offer'\}\)/g, "navigate('/offers?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Task'\}\)/g, "navigate('/tasks?action=new')");
content = content.replace(/setQuickCreateOpen\(\{isOpen: true, title: 'New Campaign'\}\)/g, "navigate('/marketing-dashboard?action=new')");

// Also remove the entire QUICK CREATE MODAL section
const modalStart = content.indexOf('{/* QUICK CREATE MODAL */}');
if (modalStart !== -1) {
    let modalEnd = content.indexOf('{/* STICKY FOOTER */}');
    if (modalEnd !== -1) {
        content = content.substring(0, modalStart) + content.substring(modalEnd);
    }
}

fs.writeFileSync(file, content, 'utf8');
