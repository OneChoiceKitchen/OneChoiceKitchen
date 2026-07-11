const fs = require('fs');
let code = fs.readFileSync('apps/admin/admin-portal/src/app/app.tsx', 'utf8');

const iconMap = {
  '📊': 'LayoutDashboard', '🌍': 'Globe', '📈': 'BarChart2', '💹': 'DollarSign',
  '👥': 'Users', '🖥️': 'Monitor', '🍽️': 'Store', '🏢': 'Building',
  '📋': 'ClipboardList', '🍱': 'Package', '📦': 'Box', '🍴': 'Store',
  '🪑': 'Grid', '⏳': 'Clock', '🎉': 'PartyPopper', '🏰': 'MapPin',
  '📅': 'CalendarDays', '🛒': 'ShoppingCart', '🛍️': 'ShoppingBag', '⭐': 'Star',
  '🤝': 'Handshake', '📢': 'Volume2', '🎁': 'Gift', '🌐': 'Globe2',
  '🖼️': 'ImageIcon', '📝': 'FileText', '💬': 'MessageSquare', '📄': 'File',
  '💰': 'Wallet', '💸': 'Banknote', '⚡': 'Zap', '👨‍💼': 'UserCircle',
  '⏱️': 'Clock', '🏖️': 'Umbrella', '💻': 'Laptop', '🎓': 'GraduationCap',
  '🎫': 'Ticket', '👋': 'LogOut', '⚙️': 'Settings', '🛠️': 'Wrench',
  '✅': 'CheckCircle', '🔐': 'Lock', '🚚': 'Truck', '💳': 'CreditCard',
  '📧': 'Mail', '📱': 'Smartphone', '📩': 'Mail', '🗺️': 'Map', '☁️': 'Cloud'
};

const uniqueIcons = new Set(Object.values(iconMap));
const importsToAdd = Array.from(uniqueIcons).join(', ');

if (!code.includes('LayoutDashboard')) {
  code = code.replace(
    /import \{ Search, Bell, User, Settings, LogOut, Activity, Keyboard, Moon, Store, Plus \} from 'lucide-react';/,
    `import { Search, Bell, User, Settings, LogOut, Activity, Keyboard, Moon, Store, Plus, ${importsToAdd} } from 'lucide-react';`
  );

  code = code.replace(/icon: '([^']+)'/g, (match, p1) => {
    if (iconMap[p1]) {
      return `icon: <${iconMap[p1]} size={20} />`;
    }
    return match;
  });

  fs.writeFileSync('apps/admin/admin-portal/src/app/app.tsx', code);
  console.log('Icons replaced successfully.');
} else {
  console.log('Icons already replaced.');
}
