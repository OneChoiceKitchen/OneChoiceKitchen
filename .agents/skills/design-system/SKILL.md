---
name: design-system
description: >
  OneChoiceKitchen design system v3.1. Brand: OCK Navy (#1A2B6D) + OCK Red (#E31E24).
  Colors extracted directly from the transparent-logo.png file.
  Azure Portal-inspired. Covers color tokens, typography, spacing, components,
  dark mode, and responsive breakpoints. Load when building UI components or
  styling any frontend. All portals (admin, web, partner, rider) MUST use these tokens.
---

# OneChoiceKitchen Design System v3.1

## Brand Identity

**Primary Brand Color:** `#1A2B6D` (OCK Navy Blue — from logo circle, "ONE" and "KITCHEN" text)  
**Accent Brand Color:** `#E31E24` (OCK Red — from chef hat, "CHOICE" text, tagline accent)  
**Design Inspiration:** Microsoft Azure Portal — clean, professional, enterprise-grade  
**Font:** Inter (Google Fonts)

> **CRITICAL:** Brand colors were extracted directly from `public/branding/transparent-logo.png`.
> The logo uses **deep navy #1A2B6D** (NOT #2563EB) and **OCK red #E31E24** (NOT #DC2626).
> NEVER use #2563EB, #0054A6, #003893 or any other blue — they do not match the logo.

---

## CSS Custom Properties (Design Tokens)

Defined in `apps/admin/admin-portal/src/styles.css` (global) and
`apps/admin/admin-portal/src/app/app.module.css` (shell-specific).

```css
:root {
  /* ── BRAND COLORS (logo-matched) ── */
  --brand-blue:    #1A2B6D;   /* OCK Navy — primary brand color */
  --brand-blue-dk: #0F1C4E;   /* Darker navy — hover / pressed state */
  --brand-blue-lt: #EEF1FB;   /* Light navy tint — row hover bg */
  --brand-blue-md: #C7CFF0;   /* Medium tint — selected / badge */

  --brand-red:     #E31E24;   /* OCK Red — accent / danger / delete */
  --brand-red-dk:  #B5171C;   /* Darker red — hover state */
  --brand-red-lt:  #FEF1F1;   /* Light red tint — error bg */
  --brand-red-md:  #FBCACA;   /* Medium red — error border */

  /* ── SEMANTIC ALIASES ── */
  --blue:   var(--brand-blue);
  --red:    var(--brand-red);
  --green:  #16a34a;    /* success */
  --yellow: #d97706;    /* warning */
  --orange: #ea580c;    /* accent */
  --purple: #7c3aed;    /* special */

  /* ── SURFACE ── */
  --bg:    #f3f4f8;   /* Azure Portal page background */
  --surf:  #ffffff;   /* Card / panel background */
  --surf2: #f1f5f9;   /* Secondary surface, table headers */
  --bdr:   #e2e8f0;   /* Default border */
  --bdr2:  #cbd5e1;   /* Hover border */

  /* ── TEXT ── */
  --text:  #0f172a;   /* Primary text */
  --text2: #475569;   /* Secondary text */
  --text3: #94a3b8;   /* Placeholder / disabled */

  /* ── TYPOGRAPHY (fluid, clamp-based) ── */
  --text-xs:   clamp(.65rem,  1vw,  .75rem);
  --text-sm:   clamp(.75rem,  1.2vw, .875rem);
  --text-base: clamp(.875rem, 1.4vw, 1rem);
  --text-lg:   clamp(1rem,    1.6vw, 1.125rem);
  --text-xl:   clamp(1.125rem,1.8vw, 1.25rem);
  --text-2xl:  clamp(1.25rem, 2.5vw, 1.5rem);
  --text-3xl:  clamp(1.5rem,  3vw,   1.875rem);
  --text-4xl:  clamp(1.875rem,4vw,   2.25rem);

  /* ── SPACING ── */
  --sp-1: .25rem;  --sp-2: .5rem;   --sp-3: .75rem;
  --sp-4: 1rem;    --sp-5: 1.25rem; --sp-6: 1.5rem;

  /* ── RADIUS ── */
  --r-sm: 6px;  --r-md: 8px;  --r-lg: 12px;
  --r-xl: 16px; --r-2xl: 24px;

  /* ── SHADOWS ── */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04);
  --shadow-lg: 0 8px 32px rgba(0,0,0,.10);
  --shadow-xl: 0 20px 60px rgba(0,0,0,.15);

  /* ── TRANSITIONS ── */
  --t-fast: .12s cubic-bezier(.4,0,.2,1);
  --t-base: .18s cubic-bezier(.4,0,.2,1);
  --t-slow: .3s  cubic-bezier(.4,0,.2,1);
}

/* Dark Mode */
[data-theme="dark"] {
  --bg:    #0f172a;
  --surf:  #1e293b;
  --surf2: #293548;
  --bdr:   #334155;
  --bdr2:  #475569;
  --text:  #f1f5f9;
  --text2: #94a3b8;
  --text3: #64748b;
  --brand-blue-lt: rgba(37,99,235,.12);
  --brand-red-lt:  rgba(220,38,38,.12);
}
```

---

## Component Classes (Global — `styles.css`)

### Page Shell (all module pages use these)
```html
<div class="page-container">
  <div class="page-header">
    <div class="page-title-block">
      <h1 class="page-title">🏪 Orders</h1>
      <p class="page-subtitle">Manage all customer orders</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary btn-sm">Export</button>
      <button class="btn btn-primary">+ New Order</button>
    </div>
  </div>

  <div class="filter-bar">
    <div class="search-bar">
      <span>🔍</span>
      <input placeholder="Search orders..." />
    </div>
    <select class="select" style="width:160px">
      <option>All Status</option>
    </select>
  </div>

  <div class="table-wrapper">
    <table class="table">...</table>
  </div>
</div>
```

### Buttons
| Class | Use |
|---|---|
| `.btn.btn-primary` | Brand Blue — primary actions |
| `.btn.btn-danger` | Brand Red — delete/cancel |
| `.btn.btn-secondary` | Neutral — secondary actions |
| `.btn.btn-ghost` | Borderless — tertiary |
| `.btn.btn-sm` / `.btn.btn-lg` | Size modifiers |
| `.btn.btn-icon` | Square icon-only button |

### Badges
| Class | Color | Use |
|---|---|---|
| `.badge.badge-blue` | Brand Blue | Info, delivered |
| `.badge.badge-red` | Brand Red | Cancelled, error |
| `.badge.badge-green` | Green | Active, success |
| `.badge.badge-yellow` | Yellow | Pending, warning |
| `.badge.badge-active` | Green | Active status |
| `.badge.badge-cancelled` | Red | Cancelled status |

### Cards
```html
<div class="card">
  <div class="card-header">
    <span class="card-title">Title</span>
    <button class="btn btn-sm btn-secondary">Action</button>
  </div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>
```

### KPI Stat Cards
```html
<div class="grid grid-4">
  <div class="stat-card">
    <p class="stat-label">Total Orders</p>
    <p class="stat-value">1,234</p>
    <span class="stat-trend-up">↑ 12% vs last month</span>
  </div>
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Grid behavior |
|---|---|---|
| Mobile | ≤480px | All grids → 1 col |
| Tablet | ≤768px | 4/3-col → 2 col |
| Laptop | ≤1024px | 6-col → 3 col |
| Desktop | ≤1280px | Default |
| Large | ≥1440px | Extended layouts |
| 4K | ≥3840px | Max layouts |

---

## Do's and Don'ts

✅ **DO:**
- Use `--brand-blue` and `--brand-red` for all brand interactions
- Use `clamp()` for fluid typography — never fixed px font sizes
- Use `.page-container` as the root wrapper for every module page (it has `flex: 1` to push footer to bottom)
- Use `.table-wrapper > .table` for all data tables
- Use `.badge-cancelled` / `.badge-active` for order statuses
- Use in-page toast/notification components for feedback — **never** `window.alert()`
- Use `modal-overlay > modal > modal-header > modal-body > modal-footer` pattern for all modals

❌ **DON'T:**
- Introduce new primary colors (orange, teal, purple as primary)
- Use hardcoded colors in component CSS — always use `var(--token)`
- Use `position: fixed` in module pages (breaks scroll)
- Skip `.page-header` structure — AI agents depend on it for consistency
- Use `window.alert()` or `window.confirm()` — always use the in-page `ConfirmModal`/`Toast` components
- Set `min-height: 100vh` on `.page-container` — this causes footer overlap; `flex: 1` handles height correctly

---

## Layout Architecture (Admin Portal)

```
.shell (100dvh flex-column)
  ├── .header (flex-shrink: 0)
  ├── .hBody (flex: 1, flex-direction: row, overflow: hidden)
  │   ├── .sidebar
  │   └── .main (flex: 1, flex-direction: column, overflow-y: auto)
  │       ├── .page-container (flex: 1 — FILLS REMAINING HEIGHT)
  │       │   ├── .page-header
  │       │   ├── .filter-bar
  │       │   └── .table-wrapper > .table
  │       └── .footer (flex-shrink: 0)
  └── [nothing else]
```

**Key rule:** Never add `min-height: calc(100vh - Xpx)` to `.page-container`.  
Use `flex: 1` only. The parent `.main` provides scrolling.

---

## Inventory / DB Data Enrichment Pattern

When mapping API response objects to UI interfaces, use module-level lookup tables to enrich sparse DB records:

```typescript
// Module-level (outside component) — not inside useEffect/component body
const SKU_META: Record<string, {category:string; unit:string; price:number}> = {
  'GRN': {category:'Grains & Flour', unit:'kg',  price:90},
  'OIL': {category:'Oils & Fats',    unit:'ltr', price:200},
  // ...
};

const mapDbItem = (item: any): MyInterface => {
  const prefix = item.sku.split('-')[0].toUpperCase();
  const meta   = SKU_META[prefix] || {category:'General', unit:'units', price:0};
  const price  = item.pricePerUnit ?? meta.price;
  return { ...item, category: item.category || meta.category, unit: item.unit || meta.unit, price };
};
```

**Dev fallback:** In `development` mode only, show MOCK data when API fails or returns empty — never in production:
```typescript
setItems(mapped.length > 0 ? mapped : (process.env['NODE_ENV']==='development' ? MOCK : []));
```

---

## Form Field Design Rules (MANDATORY — all portals, all forms)

### Rule: Every field MUST have hint text

Every `<input>`, `<select>`, and `<textarea>` in any admin/portal form **MUST** include a `<span className="form-hint">` (or `<p className="form-hint">`) below the input explaining:
- **What** the field is used for in the business context
- **Format example** — e.g. `e.g. +91 9876543210`
- **Constraints** if any — e.g. `Max 160 characters`

This applies project-wide: Admin Portal, Web Portal, Partner Portal, Rider Portal, all modals, all inline edits.

### Standard Form Field Pattern

```tsx
<div className="form-group">
  <label className="form-label">
    Branch Name <span style={{ color: 'var(--brand-red)' }}>*</span>
  </label>
  <input
    className="input"
    type="text"
    placeholder="e.g. MG Road, Bengaluru"
    value={form.name}
    onChange={e => setForm({ ...form, name: e.target.value })}
  />
  <span className="form-hint">
    This name appears on QR codes, customer receipts, and the customer app. Use the area name for clarity.
  </span>
</div>
```

### Hint Text CSS (already in styles.css — do not re-add)

```css
.form-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text3);
  margin-top: 0.25rem;
  line-height: 1.4;
}
```

### Form Actions Row Pattern

Always use the `form-actions` class for the button row — never float or absolute-position buttons:

```tsx
<div className="form-actions">
  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : (editId ? 'Save Changes' : 'Create Branch')}
  </button>
</div>
```

### Labels Must Be Title Case

Form labels must be in **Title Case**, never ALL CAPS.
- ✅ `Branch Name`, `Primary Phone Number`, `Operating Hours`
- ❌ `BRANCH NAME`, `PRIMARY PHONE NUMBER`, `OPERATING HOURS`

---

## Form State Initialization Rule (MANDATORY)

**NEVER** reset a form with `setForm({} as any)`. This leaves all typed fields as `undefined` causing runtime crashes (e.g. `.toString()` on undefined).

**Always define an `EMPTY_FORM` constant** above the component with safe defaults for every field:

```typescript
// ✅ CORRECT — define outside the component
const EMPTY_FORM = {
  restaurantId: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  mondayHours: '09:00 - 22:00',
  tuesdayHours: '09:00 - 22:00',
  wednesdayHours: '09:00 - 22:00',
  thursdayHours: '09:00 - 22:00',
  fridayHours: '09:00 - 22:00',
  saturdayHours: '09:00 - 22:00',
  sundayHours: '09:00 - 22:00',
  isActive: true,
  // ... all other fields
};

// ✅ CORRECT — use EMPTY_FORM to reset
setForm(EMPTY_FORM);

// ❌ WRONG — crashes on any .toString() call
setForm({} as any);
```

Also add defensive guards for any `.toString()` calls on potentially null/undefined form fields:
```typescript
// ✅ Safe
value={(form[key] ?? '09:00 - 22:00').toString().split(' - ')[0]}

// ❌ Crashes when form[key] is undefined
value={form[key].toString().split(' - ')[0]}
```

---

## Pagination Component (MANDATORY STANDARD — all tables, all portals)

### Design Reference
Exact layout from approved screenshot:
```
«  <  [ 1 of 1 ]  [ 25 rows per page ▾ ]  >  »
```

| Element | Symbol | Description |
|---|---|---|
| First page | `«` | Jump to first page — disabled on page 1 |
| Previous   | `<` | Previous page — disabled on page 1 |
| Page info  | `1 of 1` | Current / total pages — read-only label |
| Rows select| `25 rows per page ▾` | Dropdown: 10, 25, 50, 100 |
| Next       | `>` | Next page — disabled on last page |
| Last page  | `»` | Jump to last page — disabled on last page |

### CSS (add to styles.css if not already present)
```css
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  font-size: var(--text-sm);
  color: var(--text2);
}
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--bdr);
  border-radius: var(--r-sm);
  background: var(--surf);
  color: var(--text);
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast);
}
.pagination-btn:hover:not(:disabled) {
  background: var(--brand-blue-lt);
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-info {
  padding: 0 8px;
  white-space: nowrap;
  font-size: var(--text-sm);
  color: var(--text2);
}
.pagination-select {
  height: 28px;
  border: 1px solid var(--bdr);
  border-radius: var(--r-sm);
  padding: 0 24px 0 8px;
  font-size: var(--text-sm);
  background: var(--surf);
  color: var(--text);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.pagination-select:focus {
  outline: none;
  border-color: var(--brand-blue);
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}
```

### TSX Reusable Component (drop-in for every table)
```tsx
interface PaginationProps {
  page: number;           // 1-based current page
  totalPages: number;
  pageSize: number;       // rows per page (10 | 25 | 50 | 100)
  onPageChange: (p: number) => void;
  onPageSizeChange: (ps: number) => void;
}

function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        title="First page"
      >«</button>
      <button
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        title="Previous page"
      >&lt;</button>

      <span className="pagination-info">{page} of {totalPages || 1}</span>

      <select
        className="pagination-select"
        value={pageSize}
        onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
        aria-label="Rows per page"
      >
        {[10, 25, 50, 100].map(n => (
          <option key={n} value={n}>{n} rows per page</option>
        ))}
      </select>

      <button
        className="pagination-btn"
        disabled={page >= (totalPages || 1)}
        onClick={() => onPageChange(page + 1)}
        title="Next page"
      >&gt;</button>
      <button
        className="pagination-btn"
        disabled={page >= (totalPages || 1)}
        onClick={() => onPageChange(totalPages || 1)}
        title="Last page"
      >»</button>
    </div>
  );
}
```

### Usage pattern (with client-side pagination hook)
```tsx
// In your page component:
const [page, setPage]         = useState(1);
const [pageSize, setPageSize] = useState(25);

const totalPages = Math.ceil(items.length / pageSize);
const pageItems  = items.slice((page - 1) * pageSize, page * pageSize);

// In JSX — always below the table-wrapper:
<div className="table-wrapper">
  <table className="table">
    ...rows from pageItems...
  </table>
</div>
<Pagination
  page={page}
  totalPages={totalPages}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={ps => { setPageSize(ps); setPage(1); }}
/>
```

> [!IMPORTANT]
> This pagination is **MANDATORY** for ALL data tables across all portals (Admin, Web, Partner, Rider).
> Default page size: **25 rows**. Available options: 10 / 25 / 50 / 100.
> Layout must always follow: `« < [N of M] [rows-per-page ▾] > »`
> Never use a different pagination UI — custom pagination breaks UX consistency.

---

## Quick Create URL Action Pattern

When a Quick Create header menu item should **open a modal directly** (not just navigate to a tab), use URL query params:

**app.tsx — Quick Create click:**
```typescript
nav('branches', { action: 'new' })
// This navigates to ?tab=branches&action=new
```

**Page component — auto-open on mount:**
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'new') {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    // Clear the query param so refresh doesn't re-open
    window.history.replaceState({}, '', window.location.pathname + '?tab=branches');
  }
}, []);
```

Apply this pattern to all Quick Create actions: New Branch, New Menu, New Order, New Customer, etc.
