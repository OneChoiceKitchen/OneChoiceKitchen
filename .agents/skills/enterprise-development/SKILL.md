---
name: enterprise-development
description: >
  Enterprise coding standards for OneChoiceKitchen. Apply on every code change.
  Covers SOLID principles, clean architecture, error handling, logging,
  security expectations, code review standards, and documentation requirements.
---

# Enterprise Development Standards

## Core Philosophy

Every line of code written for OneChoiceKitchen must be:
- **Maintainable** — readable by any engineer 6 months from now
- **Testable** — can be unit tested in isolation
- **Secure** — passes OWASP checks
- **Performant** — measured, not guessed
- **Documented** — intent is clear without reading the implementation

---

## SOLID Principles (Mandatory)

### Single Responsibility Principle
Each class, function, and module does exactly ONE thing.
```typescript
// ❌ Bad — UserService handles auth AND profile AND notifications
class UserService {
  login() { ... }
  updateProfile() { ... }
  sendWelcomeEmail() { ... }
}

// ✅ Good — Each concern is separated
class AuthService { login() { ... } }
class UserProfileService { updateProfile() { ... } }
class UserNotificationService { sendWelcomeEmail() { ... } }
```

### Open/Closed Principle
Open for extension, closed for modification. Use interfaces and dependency injection.

### Liskov Substitution Principle
Subtypes must be substitutable for their base types without breaking functionality.

### Interface Segregation Principle
Many specific interfaces are better than one general-purpose interface.

### Dependency Inversion Principle
Depend on abstractions, not concretions. Use NestJS DI container.

---

## Clean Architecture

### Layer Structure (API)
```
Controller  →  Service  →  Repository  →  Database
     ↓             ↓            ↓
  Validation    Business      Prisma
  Guards        Logic         Queries
  DTOs          Domain        Models
```

### Rules
- Controllers handle HTTP only — no business logic in controllers
- Services handle business logic — no database queries directly in services
- Repositories/data-access layers handle all database operations
- DTOs validate and transform all input/output
- Never expose Prisma models directly in API responses — use response DTOs

### Directory Structure (NestJS Module)
```
src/
  orders/
    orders.module.ts
    orders.controller.ts
    orders.service.ts
    orders.repository.ts
    dto/
      create-order.dto.ts
      order-response.dto.ts
    entities/
      order.entity.ts
    tests/
      orders.service.spec.ts
      orders.controller.spec.ts
```

---

## Error Handling

### Backend (NestJS)

Always throw typed HTTP exceptions:
```typescript
// ✅ Correct
throw new NotFoundException(`Order ${orderId} not found`);
throw new BadRequestException('Cart is empty');
throw new ForbiddenException('You do not have access to this resource');
throw new ConflictException('Order already exists');
```

Global exception filter must be registered. Never let unhandled exceptions reach the client.

Error response shape (standard):
```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found",
  "timestamp": "2026-07-09T10:00:00Z",
  "path": "/api/orders/123"
}
```

### Frontend (Next.js)

- Use error boundaries for React tree errors
- Handle API errors with try/catch in server actions and API calls
- Show user-friendly error messages — never expose raw error objects
- Log errors to Sentry or equivalent monitoring

---

## Logging Standards

### Backend
Use NestJS Logger. Structured logging only.

```typescript
private readonly logger = new Logger(OrdersService.name);

// Log at appropriate levels
this.logger.log(`Order created: ${orderId}`, { userId, restaurantId });
this.logger.warn(`Low inventory for item: ${itemId}`);
this.logger.error(`Payment failed`, { orderId, error: error.message, stack: error.stack });
```

Log levels:
| Level | When |
|-------|------|
| `log` | Normal operations (order placed, user registered) |
| `warn` | Recoverable issues (retry required, slow query) |
| `error` | Failures that need attention (payment failed, DB error) |
| `debug` | Dev only — never in production |
| `verbose` | Trace-level — never in production |

**NEVER log:** passwords, tokens, card numbers, personal data (PII)

---

## Security Expectations

- All API endpoints require authentication unless explicitly marked public
- All inputs validated with `class-validator` DTOs
- All database queries use Prisma (parameterized — no raw SQL with user input)
- Passwords hashed with bcrypt (min 10 rounds)
- JWT expiry: access token 15 minutes, refresh token 7 days
- Rate limiting on all public endpoints
- CORS configured explicitly — no wildcard origins in production
- Secrets only via environment variables — never hardcoded

---

## Code Review Expectations

Before any PR is merged:
- [ ] No business logic in controllers
- [ ] All public methods have JSDoc comments
- [ ] All new features have unit tests
- [ ] No `console.log` in production code
- [ ] No TODO comments without an issue reference
- [ ] TypeScript strict mode passes — no `any` without justification
- [ ] Error handling implemented at all async boundaries
- [ ] DTOs used for all request/response shapes
- [ ] Sensitive data not logged
- [ ] `pnpm nx affected:test && lint && build` passes

---

## TypeScript Standards

- `strict: true` in all tsconfig files
- No `any` — use `unknown` and narrow, or proper types
- Prefer `interface` over `type` for object shapes
- Prefer `const` over `let`, never `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Explicit return types on all public functions

---

## Documentation Requirements

- All public APIs documented with Swagger/OpenAPI decorators
- All public classes and methods have JSDoc
- Complex business logic has inline comments explaining WHY (not WHAT)
- ADR created for all architectural decisions
- CHANGELOG.md updated for all releases
- README.md kept current for all apps

---

## AI Agent Credit Efficiency (MANDATORY — ENFORCED STRICTLY)

> **User directive. Violations are unacceptable. Every wasted tool call costs real money.**

### Hard Call Budgets
| Task type | Max tool calls |
|---|---|
| 1-line CSS/JSX fix | 3 (grep → view → replace) |
| Multi-location fix in 1 file | 4 (grep → view → multi_replace → done) |
| Feature add (new component) | 8 |
| Bug investigation | 5 |
| Browser/visual verification | 0 unless user asks, or change is non-trivial animation |

### IDE-First Rules (This is an IDE — use it like one)
- **Grep first**: Use `grep_search` to find the exact line. Do NOT `view_file` entire sections speculatively.
- **View only the lines you need**: `StartLine`/`EndLine` must be tight — never view 50 lines when 10 suffice.
- **No `run_command` for grep**: Use `grep_search` tool instead — it costs 0 browser credits.
- **No browser tests for CSS-only fixes**: If you changed 1 CSS property, trust it. Do NOT launch a browser subagent.
- **No TS compile check for CSS-only changes**: TSC is irrelevant for `.css` edits.
- **No `run_command` structure checks**: Use `grep_search` + `view_file` — shell commands cost extra.

### What NOT to do (examples of waste)
- ❌ Running `grep` via `run_command` then also `grep_search` for the same pattern
- ❌ Viewing cwGrid CSS to "compare" when the problem is in favGrid — grep the specific class
- ❌ Launching browser subagent after a 1-line padding change
- ❌ Running `tsc` after editing `.css` files
- ❌ Using `multi_replace` with 2 chunks when `replace_file_content` handles a contiguous block
- ❌ Viewing 30 lines of context around a known line number
- ❌ **Writing TSX/JS/TS files via `run_command` or PowerShell** — PowerShell here-strings corrupt JS template literals (backticks), causing cascading fix loops. ALWAYS use `write_to_file` for new files and `replace_file_content`/`multi_replace_file_content` for edits.
- ❌ Running `tsc` multiple times in a loop to iteratively fix errors — read the full error list first, fix all at once in one `multi_replace_file_content` call
- ❌ Running ANY verification command unless the user explicitly asked for it or the change is architectural

### Required Workflow for Simple Fixes
1. `grep_search` → find the class/line
2. `view_file` → view only ±5 lines around it
3. `replace_file_content` or `multi_replace_file_content` → make the fix
4. **Stop.** Do not verify unless user asks.

### Real Data First — STRICT RULE (Updated)
**NEVER** inject mock data into state when an API call fails or returns empty.
This hides real problems (empty DB, wrong API endpoint, auth errors) from the user.

```typescript
// ✅ CORRECT — show real data; show empty state when API returns []
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/branches', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    setBranches(Array.isArray(data) ? data : data.data || []);
    // Empty array [] is VALID — user hasn't created any records yet
  } catch (e) {
    // Show error banner — NEVER inject mock data
    setError('Failed to load data. Please check your connection.');
    setBranches([]);
    console.warn('[PageName] API error:', e);
  } finally {
    setLoading(false);
  }
};

// ❌ WRONG — hides the real problem by showing fake data
} catch (e) {
  setBranches(MOCK_BRANCHES);  // User thinks data loaded, but it's fake
  setRestaurants(MOCK_RESTAURANTS);
}
```

**The error banner pattern** — show this when API fails:
```tsx
{error && (
  <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca',
    padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
    ⚠️ {error}
    <button onClick={fetchData} style={{ marginLeft: '1rem', color: '#2563EB', background: 'none',
      border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
  </div>
)}
```

**When is mock data acceptable?**
- `mockData.ts` exports are for cross-module OOS status helpers (`getIngredientStatus`, `STOCK_BADGE`, `OOS_SKUS`) — these are UTILITY functions, NOT page data.
- Never import `MOCK_BRANCHES`, `MOCK_MENU_ITEMS`, `MOCK_TIFFIN_ITEMS` etc. in production fetch logic.
- If you need dev data, add it to `prisma/seeds/seed_dev_data.ts` and run the seed.

**Shared mock data file:** `apps/admin/admin-portal/src/app/pages/mockData.ts`
- `getIngredientStatus(sku)` and `STOCK_BADGE` — OK to use (utility functions)
- `MOCK_BRANCHES`, `MOCK_RESTAURANTS`, `MOCK_MENU_ITEMS`, `MOCK_TIFFIN_ITEMS` — NEVER inject into state on API failure

### Cross-Module Inventory Interlinking Pattern
- Every menu item and tiffin item carries an `ingredients[]` array with `{ sku, name, qty, unit }`.
- All modules call `getIngredientStatus(sku)` to get stock level: `'ok' | 'low' | 'critical' | 'out'`.
- Show ingredient badges in item cards/rows using `STOCK_BADGE[status]` colors.
- Show OOS banner at top of Menu Management and Tiffin Management pages when `OOS_SKUS.length > 0`.
- Banner links to `/?tab=inventory` (Inventory Management page).

---

## CRUD Form Rules (MANDATORY — every admin module)

### Edit Must Pre-populate (CRITICAL — never use `setForm({})` on edit)
```typescript
// ✅ CORRECT — pre-populate ALL fields from existing record
const handleEdit = (record: Branch) => {
  setEditId(record.id);
  setForm({
    name: record.name || '',
    phone: record.phone || '',
    city: record.city || '',
    email: record.email || '',
    address: record.address || '',
    isActive: record.isActive ?? true,
    // ... ALL other fields from the schema
  });
  setShowForm(true);
};

// ❌ WRONG — user opens Edit modal, all fields are empty
const handleEdit = (record: Branch) => {
  setEditId(record.id);
  setForm({} as any);  // This breaks edit — form is blank
  setShowForm(true);
};
```

### Submit Must Call API (CRITICAL — never fake-save)
```typescript
// ✅ CORRECT — actually calls API for create or update
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name?.trim()) { showToast('Name is required'); return; }
  if (!form.phone?.trim()) { showToast('Phone is required'); return; }
  try {
    setIsSubmitting(true);
    if (editId) {
      await axios.patch(`/api/resource/${editId}`, form, authHeaders());
      showToast('Updated successfully!', 'success');
    } else {
      await axios.post('/api/resource', form, authHeaders());
      showToast('Created successfully!', 'success');
    }
    setShowForm(false);
    fetchData();  // refresh the table
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Save failed';
    showToast(Array.isArray(msg) ? msg.join(', ') : msg);
  } finally {
    setIsSubmitting(false);
  }
};

// ❌ WRONG — silently succeeds without touching the database
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  showToast('Saved!');   // LIE — nothing was saved
  setShowForm(false);
};
```

### Data Protection: Database Restore Rule
If you need to restore original user data:
1. **FIRST** check `scripts/maintenance/dev.db` — this is often the last user-data backup
2. Copy it to root: `Copy-Item "scripts/maintenance/dev.db" "dev.db" -Force`
3. **DO NOT** run `prisma db push --accept-data-loss` after restoring — it will wipe tables
4. Always back up before replacing: `Copy-Item "dev.db" "dev.db.bak-$(Get-Date -Format 'yyyyMMdd')" -Force`

---

## Seed Scripts (MANDATORY for every new module)

### File Locations
| Script | Purpose | Auto-run via |
|---|---|---|
| `prisma/seeds/seed_dev_data.ts` | Full realistic dev data | `setup_local.ps1` after `prisma db push` |
| `prisma/seeds/seed_prod_data.ts` | Minimal baseline prod data | `setup_deployment.ps1` after `prisma migrate deploy` |

### Prisma 7.x Initialization Pattern (CRITICAL — Prisma 7+ requires adapter)
```typescript
// ✅ CORRECT — Prisma 7.x with LibSQL adapter (matches API's PrismaService pattern)
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');  // root-level dev.db — NOT prisma/dev.db
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma  = new PrismaClient({ adapter } as any);

// ❌ WRONG — Prisma 7+ throws PrismaClientInitializationError without adapter
const prisma = new PrismaClient();
```

### Critical DB Path Rule
- The API (`apps/api/src/prisma/prisma.service.ts`) uses: `join(process.cwd(), 'dev.db')` = **root `dev.db`** (1.1MB, has tables)
- `prisma db push` from `.env` pushes to `prisma/dev.db` which is **empty** (0 bytes)
- ALL seeds and scripts MUST use root `dev.db` path, NOT `prisma/dev.db`
- Always verify with: `Get-ChildItem -Recurse -Filter "dev.db" | Select FullName, Length`

### Guard-First Seeding (MANDATORY — protects user data)
```typescript
// ✅ ALWAYS check for existing data before seeding
const existingCount = await prisma.restaurant.count({ where: { isDeleted: false } });
if (existingCount > 0) {
  const ours = await prisma.restaurant.findUnique({ where: { id: RESTAURANT_ID } });
  if (!ours) {
    console.log('User data exists. Skipping seed. Use --force to override.');
    return;  // EXIT — do not overwrite user-created data
  }
}
```

### Upsert Pattern (use deterministic IDs)
```typescript
// ✅ CORRECT — always use id-based upsert so it's idempotent
await prisma.restaurantBranch.upsert({
  where:  { id: 'seed-branch-mg-road' },       // deterministic, not uuid()
  update: { isActive: true },                  // only update volatile fields
  create: { id: 'seed-branch-mg-road', ...data },
});
```

### Schema Field Verification (MANDATORY before writing seed data)
Always check actual model fields before writing create/upsert — do NOT guess:
```bash
# Check exact field names for a model
Get-Content prisma/schema.prisma | Select-Object -Skip <lineNumber> -First 30
```
Example known gotcha: `MenuItem.diet` is a String ('VEG'/'NON_VEG'), NOT `isVeg: Boolean`.

### Rules
- Use **upsert with deterministic IDs** — never `uuid()` in seed scripts.
- Dev seeds: 3+ branches, 8+ menu items, 15+ inventory items with realistic quantities/SKUs.
- Prod seeds: admin user, restaurant record, skeleton inventory SKUs only (no test data).
- NEVER use `--accept-data-loss` in production migrations — it can wipe user data.
- Mock data in the frontend (`mockData.ts`) MUST match the SKUs in `seed_dev_data.ts` exactly.

### Empty State Diagnosis Workflow (MANDATORY — check before assuming data is missing)
When a page shows empty state, follow this order:
1. **Is the API running?** → `Invoke-WebRequest http://localhost:3000/api/health`
2. **Does the endpoint return data?** → Call the endpoint with curl/Invoke-WebRequest
3. **If returns `[]`** — DB is empty. Check which `dev.db` is being used (root vs prisma/).
4. **If returns `401`** — Auth issue. Check token in localStorage.
5. **Only THEN** consider seeding: `pnpm exec ts-node prisma/seeds/seed_dev_data.ts`
6. **NEVER** assume data is missing without checking the API first.

---

## Footer / Layout Rules (Admin Portal)

### Shell Layout Pattern (MANDATORY)
```css
/* ✅ CORRECT — footer always visible */
body   { height: 100dvh; overflow: hidden; }
.shell { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.main  { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; }
.footer { flex-shrink: 0; margin-top: auto; height: 52px; }

/* ❌ WRONG — causes footer to be pushed off-screen */
.shell { min-height: 100vh; }           /* allows shell to grow beyond viewport */
.wsHome { flex: 1; }                    /* steals all space, footer disappears */
body { overflow-x: hidden; }            /* only hides horizontal, body still scrolls vertically */
```

### Rules
- `body` and `.shell` MUST use `height: 100dvh` + `overflow: hidden` — no page-level scroll.
- `.main` scrolls internally via `overflow-y: auto`.
- Content areas (`.wsHome`, `.pageWrapper`, etc.) use `flex: 0 0 auto` — **never** `flex: 1`.
- Footer uses `margin-top: auto` to always appear at the visual bottom even when content is short.
- **Never use `min-height: 100vh`** on the shell — it allows the layout to grow beyond the viewport.

---

## UI Feedback Standards (MANDATORY — NO EXCEPTIONS)

### ❌ NEVER use native browser dialogs
```typescript
// ❌ FORBIDDEN — breaks UX, not styled, blocks thread
window.alert('Something happened');
window.confirm('Are you sure?');
window.prompt('Enter value');
```

### ✅ ALWAYS use in-page feedback
| Scenario | Use |
|---|---|
| Success / info message | Toast / snackbar (auto-dismiss 3s) |
| Destructive action confirmation | In-page `<ConfirmModal>` with Cancel + Confirm buttons |
| Inline supplier/order action | In-page modal with form |
| Validation error | Inline field error below the input, NOT a toast |
| Critical error (API failure) | Inline banner inside the page, NOT a browser alert |

### In-page toast pattern (use `@org/ui-design-system` `useToast` when available)
```tsx
// If useToast is unavailable, use local state toast:
const [toast, setToast] = useState<{msg:string;type:'ok'|'err'}|null>(null);
const showToast = (msg:string, type:'ok'|'err'='ok') => {
  setToast({msg,type});
  setTimeout(()=>setToast(null), 3000);
};
// Render at bottom of page container:
// {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
```

### Confirm modal pattern
```tsx
// Use a reusable <ConfirmDialog> with:
// - Title, message, danger button label, cancel button
// - onConfirm callback
// - onCancel callback
// Never block with window.confirm()
```

---

## Form Validation Standards (MANDATORY)

Every form field must be validated **before** submission. Errors appear **inline** below each field.

### Required rules per field type
| Field type | Validation |
|---|---|
| Text (name, label) | Required, minLength 2, maxLength 100 |
| Number (price, qty, threshold) | Required, ≥ 0, criticalThreshold ≤ minThreshold |
| Phone | Pattern: `/^\+?[\d\s\-]{8,15}$/` |
| Email | Standard email pattern |
| URL | Must start with `http://` or `https://` |
| Select/Dropdown | Required — must not be default empty value |

### Validation pattern
```tsx
type Errors = Record<string, string>;

function validate(form: FormData): Errors {
  const e: Errors = {};
  if (!form.name.trim()) e.name = 'Name is required';
  if (form.name.trim().length < 2) e.name = 'Minimum 2 characters';
  if (form.quantity < 0) e.quantity = 'Cannot be negative';
  if (form.criticalThreshold > form.minThreshold)
    e.criticalThreshold = 'Critical must be ≤ Min threshold';
  return e;
}

// In submit handler:
const errs = validate(form);
if (Object.keys(errs).length > 0) { setErrors(errs); return; }
```

### Inline error display
```tsx
<div className="form-group">
  <label className="form-label">Item Name *</label>
  <input className={`input ${errors.name ? 'input-error' : ''}`} ... />
  {errors.name && <p className="form-error">{errors.name}</p>}
</div>
```
