---
name: download-pages
description: >
  Download app page implementation for all OneChoiceKitchen portals.
  Covers which apps to display in each portal, the Admin App restriction rules,
  store links, feature lists, and FAQ sections.
  
  Access rules:
  - Admin Portal (4205): Shows ALL 4 apps (Customer, Partner, Rider, Admin)
  - Partner Portal (4206): Shows ONLY 3 apps (Customer, Partner, Rider) — Admin App HIDDEN
  - Rider Portal (4207): Shows ONLY 3 apps (Customer, Partner, Rider) — Admin App HIDDEN
  - Customer Web (4208): Shows ONLY 3 apps (Customer, Partner, Rider) — Admin App HIDDEN
  
  Trigger when: adding download pages, modifying app listings, changing store links,
  updating app features, or any change to app download/install sections.
---

# Download Pages Skill

## Security Rule (CRITICAL)
The Admin App (`com.onechoicekitchen.admin`) MUST NEVER appear in:
- Customer Web Portal (4208) download page
- Partner Portal (4206) download page
- Rider Portal (4207) download page

It MUST only appear in the Admin Portal (4205) download page.

## File Locations

| Portal | Download Page File |
|--------|-------------------|
| Admin (4205) | `apps/admin/admin-portal/src/app/pages/DownloadPage.tsx` |
| Admin CSS | `apps/admin/admin-portal/src/app/pages/DownloadPage.module.css` |
| Partner (4206) | `apps/partner/partner-portal/src/app/DownloadPage.tsx` |
| Partner CSS | `apps/partner/partner-portal/src/app/DownloadPage.module.css` |
| Rider (4207) | `apps/rider/rider-portal/src/app/DownloadPage.tsx` |
| Rider CSS | `apps/rider/rider-portal/src/app/DownloadPage.module.css` |
| Customer Web | `apps/web/app/download/page.tsx` |
| Customer CSS | `apps/web/app/download/page.module.css` |

## Routing

### Admin Portal (app.tsx)
- Route key: `app_downloads`
- Rendered via `case 'app_downloads': return <DownloadPage />;`

### Partner Portal (app.tsx)
- Tab: `downloads`
- Triggered by tab button "📲 Download Apps"

### Rider Portal (app.tsx)
- Tab: `downloads`
- Triggered by tab button "📲 Download Apps"

### Customer Web (Next.js)
- Route: `/download`
- File: `apps/web/app/download/page.tsx`

## App Bundle IDs & Store URLs

| App | Play Store | App Store | Bundle ID |
|-----|-----------|-----------|-----------|
| Customer | play.google.com/...?id=com.onechoicekitchen | apps.apple.com/in/app/onechoicekitchen | com.onechoicekitchen |
| Partner | play.google.com/...?id=com.onechoicekitchen.partner | apps.apple.com/in/app/onechoicekitchen-partner | com.onechoicekitchen.partner |
| Rider | play.google.com/...?id=com.onechoicekitchen.rider | apps.apple.com/in/app/onechoicekitchen-rider | com.onechoicekitchen.rider |
| Admin | play.google.com/...?id=com.onechoicekitchen.admin | apps.apple.com/in/app/onechoicekitchen-admin | com.onechoicekitchen.admin |

## Design Pattern
- Card-based layout (one card per app)
- Each card: icon, for-who badge, name, version, description, feature list, store buttons
- Quick download table at bottom
- FAQ accordion section
- Color-coded per app: Blue (Customer), Green (Partner), Orange (Rider), Red (Admin)
