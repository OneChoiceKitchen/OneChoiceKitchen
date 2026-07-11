---
name: feature-development
description: >
  Complete end-to-end feature development workflow for OneChoiceKitchen.
  Covers the 10-step process from requirement to deployment. Use when
  implementing new features, bug fixes, or refactors.
---

# Feature Development Workflow

## The 10-Step Process

Every feature, bug fix, or refactor follows this workflow without exception.

---

### Step 1: Understand the Requirement

- Read the ticket/story completely — clarify ambiguities before coding
- Identify which business modules are affected
- Identify which apps are affected (web, admin, partner, rider, api)
- Load the `onechoice-business-rules` skill to verify domain constraints
- If the change is architectural → create an ADR first

---

### Step 2: Review Project Context

- Load `project-context` skill
- Identify affected services and their ports
- Check existing code patterns in the relevant modules
- Understand the existing data model (check Prisma schema)

---

### Step 3: Check Business Rules

- Load `onechoice-business-rules` skill
- Verify the feature doesn't violate any domain constraints
- Check: order lifecycle states, permission boundaries, pricing rules
- If rules are ambiguous → escalate to product owner before coding

---

### Step 4: Design the Solution

- Define API contracts (request/response shapes) before implementation
- Define database schema changes needed
- Create component hierarchy for UI changes
- Write the test cases BEFORE implementation (TDD approach preferred)
- If database schema changes required → check `database-migrations` skill
- If new architecture pattern → document ADR

---

### Step 5: Write Tests First

Load `testing` skill. Write:
- Unit test skeletons for service methods
- Component test skeletons for UI
- E2E test for critical user flows

Tests should fail initially (red state).

---

### Step 6: Implement

Follow this order:
1. **Database**: Schema changes + migration
2. **API**: Types → DTO → Service → Controller → Swagger docs
3. **Frontend**: Types → API client → Hook/Store → Component → Page
4. **Integration**: Connect frontend to backend

Apply `enterprise-development` and `coding-standards` skills throughout.

---

### Step 7: Run Validation (Quality Gate)

```bash
# Run all affected tests
pnpm nx affected:test

# Run lint
pnpm nx affected:lint

# Build affected apps
pnpm nx affected:build

# Type check
pnpm nx run-many --target=typecheck --all
```

**ALL must pass before proceeding.**

---

### Step 8: Update Documentation

- API changes → update Swagger decorators
- New components → update Storybook (if applicable)
- New environment variables → update `.env.example`
- New service port → update `workspace-orchestrator/references/ports.md`
- Business rule changes → update `onechoice-business-rules` skill
- Architectural changes → create/update ADR

---

### Step 9: Security Review

Load `security` skill and verify:
- [ ] All new API endpoints have authentication guards
- [ ] All input DTOs use `class-validator`
- [ ] No PII is logged
- [ ] Authorization checked (RBAC) — does the user have permission for this action?
- [ ] New environment variables documented (not hardcoded)

---

### Step 10: Prepare for Deployment

- Create PR with the checklist from `checklists/feature.md`
- Ensure CI pipeline passes (Nx Cloud)
- Add migration steps to deployment notes if schema changed
- Load `deployment` skill for deployment guidance

---

## Checklist Files

- New feature: `checklists/feature.md`
- Bug fix: `checklists/bugfix.md`
- Refactor: `checklists/refactor.md`

---

## Anti-Patterns

- ❌ Implementing without reading business rules first
- ❌ Skipping tests because "it's a small change"
- ❌ Merging with failing tests
- ❌ Hardcoding secrets or environment-specific values
- ❌ Adding UI without accessibility considerations
- ❌ Changing a shared library without running `pnpm nx affected:build`

