---
name: admin-navigation
description: >
  How to add new pages/modules to the OneChoiceKitchen Admin Portal.
  Covers the 4-step process: create component, add lazy import, add route case,
  add navigation entry. Use when adding new admin modules, pages, or features
  to the admin portal (apps/admin/admin-portal).
---

# Admin Navigation Skill

## ⚠️ MANDATORY RULE: Always Add Icons to Every Section & Element

> **Every** section heading, page title, menu item, submenu item, breadcrumb segment, and card header in the Admin Portal **MUST** have a relevant emoji or Lucide icon prefix. No exceptions.

### Icon Requirements by Element Type

| Element | Rule | Example |
|---------|------|---------|
| **Section headings** (`wsSecTitle`) | Emoji prefix | `📊 Quick Stats`, `⭐ Quick Favourites`, `🗂️ Explore Workspace`, `🕐 Continue Working` |
| **Page titles** (`page-title`) | Emoji prefix | `📦 Orders`, `👥 Customers`, `🏪 Branches` |
| **Sidebar nav items** | Lucide icon (16px) | `<LayoutGrid size={16} />` for Workspace |
| **Breadcrumb segments** | Lucide icon (13-14px) | Via `ITEM_ICONS_SM` and `WS_ICONS_SM` maps |
| **Category cards** | Lucide icon (18px) circle | Via `WS_ICONS` map |
| **Explore item rows** | Lucide icon (13px) | Via `ITEM_ICONS_SM` map |
| **KPI/stat cards** | Emoji or Lucide inline | `📈 Revenue`, `🚚 Orders` |
| **Action buttons** | Emoji prefix | `+ Create`, `📥 Export`, `🗑️ Delete` |
| **Banner titles** | Emoji prefix | `📲 Mobile Apps` |
| **Footer links** | No icon (text only is fine) | Privacy Policy, Terms |

### Section Icon Reference (WorkspaceHome)
```tsx
// ALWAYS use these exact emoji for each section:
📊 Quick Stats       // KPI numbers section
🕐 Continue Working  // Recent items section  
⭐ Quick Favourites  // User bookmarks section
🗂️ Explore Workspace // All modules grid
📲 [banner title]    // Download banner at bottom
```

### Adding Icons — Checklist
Before submitting any UI change to the admin portal:
- [ ] Every `wsSecTitle` has an emoji prefix
- [ ] Every `page-title` h1 has an emoji prefix
- [ ] Every new WORKSPACE item has an entry in `ITEM_ICONS_SM`
- [ ] Every new sidebar menu entry has a Lucide icon



### Step 1: Create Component File
```bash
# Create in pages/ directory
touch apps/admin/admin-portal/src/app/pages/MyNewPage.tsx
touch apps/admin/admin-portal/src/app/pages/MyNewPage.module.css
```

Component template:
```tsx
// MyNewPage.tsx
import React from 'react';
import styles from './MyNewPage.module.css';

export function MyNewPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🆕 My New Module</h1>
          <p className="page-subtitle">Description of this module</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">+ Create</button>
        </div>
      </div>
      <div className="filter-bar">
        {/* filters */}
      </div>
      <div className="table-wrapper">
        <table className="table">
          {/* table content */}
        </table>
      </div>
    </div>
  );
}

export default MyNewPage;
```

### Step 2: Add Lazy Import (app.tsx)
```tsx
// In the lazy imports section of app.tsx (around line 100-109)
const MyNewPage = React.lazy(() => import('./pages/MyNewPage'));
```

### Step 3: Add Route Case (renderModule function, app.tsx)
```tsx
// Find the renderModule function and add a case:
case 'my_new_module': return <MyNewPage />;
```

### Step 4: Add to WORKSPACE Navigation (app.tsx)

Find the `WORKSPACE` constant (~line 255) and add to the appropriate category:
```tsx
{ id: 'my_new_module', label: 'My New Module', desc: 'Short description' },  // ← add here
```

### Step 5: Add to ITEM_ICONS_SM (app.tsx)

Find the `ITEM_ICONS_SM` constant (~line 188) and add a small icon (13px):
```tsx
my_new_module: <SomeLucideIcon size={13} strokeWidth={2}/>,
```
The breadcrumb will automatically show `Workspace › Category › My New Module` using this icon.

> **No manual breadcrumb code needed** — `ModulePage` resolves breadcrumb automatically from
> the `WORKSPACE` structure and `ITEM_ICONS_SM` map.

## File Locations

| File | Purpose |
|------|---------|
| `apps/admin/admin-portal/src/app/app.tsx` | Main shell, routing, navigation |
| `apps/admin/admin-portal/src/app/pages/` | All page components |
| `apps/admin/admin-portal/src/styles.css` | Global design tokens |
| `apps/admin/admin-portal/src/page-defaults.css` | Page wrapper defaults |
| `apps/admin/admin-portal/src/app/app.module.css` | Shell CSS (header, sidebar) |

## CSS Classes Available (page-defaults.css)
```css
.page-container   /* Root wrapper for all pages */
.page-header      /* Top bar with title + actions */
.page-title-block /* Title + subtitle container */
.page-title       /* H1 with emoji */
.page-subtitle    /* Gray description text */
.page-actions     /* Right-side button area */
.filter-bar       /* Filter/search row */
.table-wrapper    /* Table scroll container */
.table            /* Styled data table */
.btn.btn-primary  /* Blue action button */
.btn.btn-danger   /* Red danger button */
```

## Admin KPI Cards

All modules with list views should have KPI summary cards above the table:
```tsx
<div className="kpi-row">
  <div className="kpi-card">
    <div className="kpi-label">Total Items</div>
    <div className="kpi-value">142</div>
    <div className="kpi-change kpi-up">+12% vs last month</div>
  </div>
</div>
```

## Navigation Categories in WORKSPACE

Current categories and their items (app.tsx WORKSPACE constant ~line 255):

| # | Category ID | Label | Items |
|---|-------------|-------|-------|
| 1 | restaurant-ops | Restaurant Operations | branches (Branch Management), menus (Menu Management), tiffin (Tiffin Management), inventory (Inventory Management) |
| 2 | dining | Dining Management | tables, reservations, waitlist |
| 3 | orders | Orders Management | orders, refunds, corporate, delivery_settings |
| 4 | customers | Customer Management | users, reviews, referrals, support |
| 5 | marketing | Marketing | offers, rewards, coupons, blogs |
| 6 | cms | Website & CMS | pages, sliders, comments, seo |
| 7 | finance | Finance | payouts, payment_config, subscription_plans, surge_pricing |
| 8 | hrms | HRMS | hrms_dash, attendance, leaves, payroll, shifts, assets, offboarding, hr_helpdesk, hr_compliance |
| 9 | admin-ops | Administration | tasks_admin, compliance, audit_logs, roles, partner_permissions, notification_logs |
| 10 | platform | Platform Settings | settings, email_config, sms_config, whatsapp_config, maps_config, templates, service_providers |
| 11 | system | System & Config | sla_config, app_downloads, app_links_settings |
| 12 | helpdesk | Support & Helpdesk | support, internal_chat, ai_chat |
| 13 | dashboards | Analytics | overall_dashboard, dashboard |
| 14 | communication | Communication | templates, internal_chat |

## Routing Architecture

- All tab navigation happens via `nav(tabId)` calls — sets URL `?tab=tabId`
- `ModulePage` wraps every non-home page and handles breadcrumbs automatically
- Category overview pages use `nav('cat_<categoryId>')` pattern (e.g. `nav('cat_restaurant-ops')`)
- Footer pages use their own tab IDs: `privacy_policy`, `terms_of_service`, `support_center`, `api_documentation`
