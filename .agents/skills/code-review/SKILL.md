---
name: code-review
description: >
  Code review standards and process for OneChoiceKitchen. Covers review checklist,
  what reviewers look for, PR etiquette, and quality gates. Load when reviewing
  or preparing code for review.
---

# Code Review Standards

## Review Philosophy

Code review is a quality gate, not a gatekeeping exercise.
Goal: ensure code is correct, maintainable, secure, and tested — not to impose personal style preferences.

## Reviewer Checklist

### Correctness
- [ ] Logic is correct — does it solve the stated problem?
- [ ] Business rules are respected (check onechoice-business-rules)
- [ ] Edge cases handled (empty arrays, null values, race conditions)
- [ ] Error handling present at all async boundaries

### Security
- [ ] No secrets hardcoded
- [ ] Input validated via class-validator DTOs
- [ ] Authorization checked (not just authentication)
- [ ] No SQL injection risk (Prisma used everywhere)
- [ ] No PII logged

### Testing
- [ ] Tests cover happy path AND error paths
- [ ] Tests are meaningful (not just `expect(true).toBe(true)`)
- [ ] No `it.skip` without linked issue

### Code Quality
- [ ] No TypeScript `any` without justification in comments
- [ ] No `console.log` in production code
- [ ] No dead code
- [ ] Functions are small (< 30 lines ideally)
- [ ] Names are descriptive

### Architecture
- [ ] No business logic in controllers
- [ ] No DB queries in services (use repository layer)
- [ ] Shared code in `libs/` not duplicated in `apps/`

## PR Etiquette

### Author
- Keep PRs small (< 400 lines changed)
- Add PR description explaining WHAT and WHY
- Self-review before requesting review
- Respond to all comments before merging

### Reviewer
- Respond within 1 business day
- Distinguish between blocking and non-blocking comments:
  - `nit:` — Non-blocking (style preference)
  - `suggestion:` — Improvement idea (non-blocking)
  - `question:` — Seeking understanding
  - No prefix — Blocking (must fix)
- Approve only when all blocking comments resolved
- Praise good code when you see it

## Quality Gate (CI must pass)

Before merging, CI verifies:
- `pnpm nx affected:test` — all tests pass
- `pnpm nx affected:lint` — no lint errors
- `pnpm nx affected:build` — builds successfully
- TypeScript strict mode passes

Never merge with failing CI.
