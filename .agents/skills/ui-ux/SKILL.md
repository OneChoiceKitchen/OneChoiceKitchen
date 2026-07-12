---
name: ui-ux
description: >
  UI/UX principles and patterns for OneChoiceKitchen. Covers user flows for
  ordering, navigation patterns, feedback states, error handling, and
  food delivery-specific UX best practices. Also documents the Azure Portal-inspired
  admin portal design language with OCK Navy+Red brand identity. Load when building
  any UI across admin, web, partner, or rider portals.
---

# UI/UX Standards

## Admin Portal Design Language

**Inspiration:** Microsoft Azure Portal  
**Brand:** OCK Navy (#1A2B6D) + OCK Red (#E31E24) — extracted from `public/branding/transparent-logo.png`  
**Key traits:** Clean white surfaces, `#f3f4f8` background, compact table-centric UI,
sticky headers, consistent page padding via `.page-container`.

> **CRITICAL — Brand Colors:**
> - Primary / active / buttons: `#1A2B6D` (OCK Navy) — NEVER use #2563EB
> - Danger / delete / error: `#E31E24` (OCK Red) — NEVER use #DC2626 or #ef4444
> - Hover / darker navy: `#0F1C4E`
> - Row hover tint: `#EEF1FB` (--brand-blue-lt)
> - Focus ring: `0 0 0 3px rgba(26,43,109,.15)`

### Page Structure Pattern (all admin module pages)
```
page-container
  ├── page-header
  │     ├── page-title-block (title + subtitle)
  │     └── page-actions (buttons)
  ├── filter-bar (search + selects)
  └── table-wrapper / card grid
```

### Interactive Element Rules
- **Buttons:** `btn-primary` (Navy #1A2B6D) for create/save; `btn-danger` (Red #E31E24) for delete/cancel
- **EVERY button (actionable OR non-actionable) MUST have BOTH an icon AND a text label** — never icon-only or text-only
- **Table hover:** Rows highlight with `--brand-blue-lt` (#EEF1FB navy tint)
- **Focus rings:** Always `--brand-blue` at 3px `0 0 0 3px rgba(26,43,109,.15)`
- **Notification badge:** Brand Red (urgency)
- **Form validation error:** Brand Red text + border
- **Success state:** `--green` (#16a34a)

### Brand Logo & Badge
- Logo image: `/branding/transparent-logo.png` (white/transparent background)
- OCK badge gradient: `linear-gradient(135deg, #2563EB 0%, #DC2626 100%)` — Blue to Red
- Never use solid blue or solid red for the badge — always the Blue→Red gradient

---

## Admin Table Standards (apply on EVERY data table)

### Mandatory Features — NEVER skip any of these
Every admin module table MUST include ALL of the following:
1. **Search** — text filter across key columns (name, email, mobile, etc.)
2. **Column Sorting** — ALL columns must be sortable; click header toggles asc/desc with icon (`↑ ↓ ↕`)
3. **Filters** — status dropdown + domain-specific dropdowns; ALL in ONE horizontal row with search
4. **Pagination** — with rows-per-page selector (see design below); ALWAYS visible even on 1 page
5. **Export CSV** — always in the page header actions; exports the CURRENT filtered+sorted view
6. **Import CSV** — always in the page header; includes a "Sample Template" download button
7. **Record count** — `X / Y records` right-aligned in the filter bar (filtered count / total count)

### Filter Bar Layout (ONE horizontal row — MANDATORY)
```tsx
<div style={{
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.625rem 0', flexWrap: 'nowrap', overflowX: 'auto',
}}>
  {/* Search — flexible width, grows with space */}
  <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 180, maxWidth: 300 }}>
    <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
    <input className="input" style={{ paddingLeft: '2.1rem', width: '100%' }} placeholder="Search…" />
  </div>
  {/* Status filter — fixed narrow width */}
  <select className="input" style={{ flex: '0 0 auto', width: 130 }}>…</select>
  {/* Additional filters — fixed width */}
  <select className="input" style={{ flex: '0 0 auto', width: 140 }}>…</select>
  {/* Record count — pushed to the far right */}
  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
    {filtered} / {total} records
  </span>
</div>
```

### Button Rules (EVERY button MUST follow this — no exceptions)
```tsx
// ✅ CORRECT — icon + text label always together
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <Edit2 size={14} /> Edit
</button>
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <Trash2 size={14} /> Delete
</button>
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <Download size={14} /> Export CSV
</button>
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <Upload size={14} /> Import CSV
</button>
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <FileDown size={14} /> Sample Template
</button>
<button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  <CheckCircle size={14} /> Approve
</button>

// ❌ WRONG — icon only (never do this)
<button><Edit2 size={14} /></button>
```

### Inline action buttons (table row actions) — use ActBtn pattern
```tsx
const ActBtn = ({ icon, label, onClick, danger = false }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
    background: danger ? '#fef2f2' : '#eff6ff',
    color: danger ? '#DC2626' : '#2563EB',
  }}>
    {icon} {label}
  </button>
);
// Usage: <ActBtn icon={<Edit2 size={13} />} label="Edit" onClick={...} />
// Usage: <ActBtn icon={<Trash2 size={13} />} label="Delete" onClick={...} danger />
```

### Column Sorting (apply to ALL columns)
```tsx
function SortIco({ active, dir }) {
  if (!active) return <ChevronsUpDown size={12} style={{ opacity: 0.35, marginLeft: 3 }} />;
  return dir === 'asc'
    ? <ChevronUp size={12} style={{ color: '#2563EB', marginLeft: 3 }} />
    : <ChevronDown size={12} style={{ color: '#2563EB', marginLeft: 3 }} />;
}

const Th = ({ k, label }) => (
  <th onClick={() => handleSort(k)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {label} <SortIco active={sortKey === k} dir={sortDir} />
    </span>
  </th>
);
// Use <Th k="name" label="Name" /> for EVERY column header
// Only the "Actions" column should NOT be sortable
```

### Import Modal Pattern (MANDATORY — import must open a popup, NOT inline)
```
┌─────────────────────────────────────────────────┐
│  📥 Import Users                            [×]  │
├─────────────────────────────────────────────────┤
│  📋 Step 1 — Sample Template                    │
│  [Download CSV] [Download Excel]                 │
│  ┌─────────────┬───────────┬───────────┐        │
│  │ Full Name   │ Email     │ Mobile    │        │  ← Blue header row
│  ├─────────────┼───────────┼───────────┤        │
│  │ John Doe    │ john@...  │ +91 9876… │        │  ← Example row
│  └─────────────┴───────────┴───────────┘        │
│                                                 │
│  ⬆️ Step 2 — Upload Your File                  │
│  ┌─────────────────────────────────────┐        │
│  │  📂 Drag & drop or click to browse  │        │  ← Dashed border, click to open file picker
│  │  .csv, .xlsx, .xls accepted         │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  [Cancel]    [⬆️ Start Import]                  │
└─────────────────────────────────────────────────┘
```
- Always implemented as a **modal popup** — never inline
- `xlsx` package (pnpm add xlsx) required for Excel read/write  
- Shows sample template data **inside the modal** with blue header row  
- Download buttons for both CSV and Excel formats  
- Drag & drop + click-to-browse upload area
- Shows import results inline (success count, error rows)
- File input: `accept=".csv,.xlsx,.xls"`

```tsx
// Excel read (xlsx package)
async function parseUploadedFile(file: File): Promise<string[][]> {
  if (file.name.endsWith('.csv')) {
    const text = await file.text();
    return text.trim().split('\n').map(line =>
      line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
    );
  }
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
}

// Excel write
async function exportExcel(filename: string, headers: string[], rows: string[][]) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename + '.xlsx');
}
```

### Export — always support BOTH CSV and Excel
- Export button opens a small dropdown: "Export as CSV" and "Export as Excel"  
- Exports the **current filtered+sorted view** (not all records)
- CSV uses BOM (`\uFEFF`) for correct Excel UTF-8 encoding

### Add/Edit Modal — tab-aware, full fields per entity type
- Modal title must reflect what is being added: "Add User", "Add Partner", "Register Rider"
- Show an info banner inside the modal: `"Creating new [entity type]"` or `"Editing [entity]"`
- **Users**: Full Name, Email, Mobile, Role (dropdown from /api/roles), Status toggle
- **Partners**: Restaurant Name, Owner Name, Email, Mobile, Address, FSSAI Number
- **Riders**: Full Name, Mobile, Vehicle Type (Bike/Car/Bicycle/Scooter/Auto), License Number, Address
- Footer has: `[Cancel]` + `[Save Changes / Create User / Submit Request / Register Rider]`


### Pagination Design (canonical — ALWAYS use this exact layout)
```
«  ‹   1 of 5   [25 rows per page ∨]   ›  »
```
- Each of `«` `‹` `›` `»` is a **square 32×32 button** with border
- Middle text shows `{currentPage} of {totalPages}` in bold
- **Rows-per-page dropdown** options: 10, 25, 50, 100 — default 25
- All controls **right-aligned** (`justifyContent: 'flex-end'`)
- Separated from table by a top border line
- Boundary buttons greyed + `cursor: not-allowed` when disabled
- **Always visible** — even on 1 page (rows-per-page selector must always be accessible)

```tsx
const pgBtnStyle = (disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 6,
  border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.9rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#cbd5e1' : '#334155',
  lineHeight: 1,
});

<div style={{
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  gap: '0.35rem', padding: '0.5rem 0', borderTop: '1px solid #e2e8f0',
}}>
  <button onClick={() => setPage(1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)}>«</button>
  <button onClick={() => setPage(p => p - 1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)}>‹</button>
  <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, padding: '0 0.4rem', whiteSpace: 'nowrap' }}>
    {safePage} of {totalPages}
  </span>
  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
    style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.32rem 0.6rem', background: '#fff', cursor: 'pointer', height: 32 }}>
    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} rows per page</option>)}
  </select>
  <button onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)}>›</button>
  <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)}>»</button>
</div>
```

---

## Continue Working (Recent Pages)

The admin home tracks recently visited modules via `pushRecent(id)`.

**How it works:**
- `nav(id)` calls `pushRecent(id)` + fires `window.dispatchEvent(new CustomEvent('ock_recent_changed'))`
- `WorkspaceHome` listens to `ock_recent_changed` event and calls `setRecent(getRecent())` to refresh
- The last 10 visited modules are stored in `localStorage.ock_recent`

**Rule:** Do NOT call `pushRecent` manually from child pages. The main `nav()` function handles it.
**Rule:** `WorkspaceHome` uses `CW_LIMIT = 8` max cards before the "View All" button.

### CRITICAL: Category pages (cat_*) must be in LABEL_MAP, DESC_MAP, and CW_SVG
When a user visits a category page (e.g., clicking "Orders" category in sidebar nav), the ID stored is `cat_orders`, NOT `orders`.  
If `cat_orders` is NOT in `LABEL_MAP`, the Continue Working card will display the raw ID `cat_orders` instead of "Orders".

**Always add ALL `cat_<catId>` IDs to these three maps in `WorkspaceHome`:**
```tsx
// LABEL_MAP — human label
cat_orders: 'Orders',
cat_customers: 'Customers',
cat_marketing: 'Marketing',
'cat_restaurant-ops': 'Restaurant Ops',  // note: hyphenated keys need quotes
// ... all cat_* IDs

// DESC_MAP — description shown on hover
cat_orders: 'All order management & tracking tools',
cat_customers: 'Customers, partners & rider management',
// ...

// CW_SVG — icon + color + bg
cat_orders: { color: '#16A34A', bg: '#DCFCE7', icon: <ShoppingBag size={20} /> },
cat_customers: { color: '#7C3AED', bg: '#F5F3FF', icon: <Users size={20} /> },
// ...
```
**Rule:** For every `case 'cat_xyz': return <CategoryPage .../>` in the router switch, there MUST be a corresponding entry in all three maps.

---

## Quick Favourites Grid

- Max **8 cards** shown on large screens (`grid-template-columns: repeat(8, 1fr)`)
- The 8-item limit is enforced via `FAV_LIMIT = 8` — never exceed this default cap
- Do NOT add hardcoded "always shown" extra cards — this breaks the 8-column grid alignment
- "View All" button reveals all user-saved favourites beyond 8
- Users manage their favourites via the `⚙ Manage →` modal


1. **Speed above all** — food delivery is time-sensitive. Every screen must load fast.
2. **Trust signals** — ratings, photos, and delivery time estimates are critical
3. **Reduce friction** — minimize steps between "hungry" and "order placed"
4. **Clear status** — users must always know what's happening with their order
5. **Mobile-first** — majority of users are on mobile

---

## Key User Flows

### Customer Ordering Flow (Optimize This)
```
Home → Search/Browse → Restaurant → Menu → Cart → Address → Payment → Confirmation
```
Target: < 5 taps from restaurant discovery to order placement.

### Order Tracking Flow
- Real-time status updates (WebSocket)
- Show rider location on map when assigned
- Estimated delivery time prominently displayed
- One-tap contact rider button

### Partner Portal Flow
- New orders appear immediately with audio alert
- Accept/reject within 30 seconds (auto-reject if missed)
- Clear prep time selector
- Order queue view (sorted by pickup time)

---

## Loading States

Every async operation must show appropriate loading UI:

```tsx
// Skeleton loading (preferred over spinners for content)
function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card animate-pulse">
      <div className="h-48 bg-gray-200 rounded" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// Spinner for actions (add to cart, place order)
<button disabled={isLoading}>
  {isLoading ? <Spinner size="sm" /> : 'Add to Cart'}
</button>
```

## Error States

Every error must:
1. Be visible and clearly communicate what went wrong
2. Offer a recovery action
3. NOT expose technical details to users

```tsx
function OrderError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="error-state">
      <AlertCircle aria-hidden="true" />
      <h2>Order Failed</h2>
      <p>We couldn't place your order. Your payment was not charged.</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}
```

## Empty States

Never show a blank page. All empty states need:
- Illustration or icon
- Descriptive message
- Call to action

```tsx
function EmptyOrderHistory() {
  return (
    <div className="empty-state">
      <ShoppingBag size={48} className="text-gray-400" />
      <h2>No orders yet</h2>
      <p>When you place your first order, it will appear here.</p>
      <Link href="/restaurants">
        <button>Order Now</button>
      </Link>
    </div>
  );
}
```

## Toast Notifications (In-App)

- Success: Green, 3 seconds, top-right
- Error: Red, 5 seconds, persistent (has close button)
- Info: Blue, 4 seconds
- Never more than 2 toasts at once

```tsx
toast.success('Order placed! Estimated delivery: 35 min');
toast.error('Payment failed. Please check your card details.');
```

## Mobile-Specific UX

- Touch targets: minimum 44x44px
- Bottom navigation bar for primary app sections
- Swipe gestures for common actions (swipe to dismiss)
- One-handed reachability: important actions in bottom third of screen
- Safe area insets respected (iOS notch)

## Form Design

- Always show real-time validation (not just on submit)
- Required fields marked clearly
- Success confirmation after form submission
- Preserve form state on navigation (don't lose draft orders)
- OTP input auto-focuses next field

## Performance UX

- Show content as it loads (streaming) — not blank → full content
- Optimistic UI for cart operations (instant feedback)
- Store recent searches and addresses for fast re-order

