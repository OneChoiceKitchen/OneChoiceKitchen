# ADR-001: Nx Monorepo Architecture

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use Nx as the monorepo build system for all OneChoiceKitchen applications and libraries.

---

## Context

OneChoiceKitchen requires multiple interconnected applications: a customer web app, admin portal, partner portal, rider portal, mobile apps, and a shared backend API. These applications share significant code (types, utilities, UI components, API clients) and need to be developed, tested, and deployed as a cohesive system.

---

## Problem

Managing multiple separate repositories (polyrepo) for these applications would result in:
- Duplicated code across repos (types, utils, UI components)
- Difficult cross-cutting changes (auth flow change requires N PRs across N repos)
- Inconsistent tooling and dependency versions
- Complex CI/CD orchestration
- Developer context-switching overhead

---

## Options Considered

### Option 1: Polyrepo (separate git repos per app)
- ✅ Team isolation
- ❌ Code sharing requires published packages
- ❌ Breaking changes require coordinated releases
- ❌ Dependency drift across repos

### Option 2: Simple Monorepo (single repo, no tooling)
- ✅ Code sharing
- ❌ No build caching
- ❌ No affected-build awareness
- ❌ Slow CI as project grows

### Option 3: Nx Monorepo (selected)
- ✅ Intelligent build caching (local + Nx Cloud)
- ✅ `affected` commands run only what changed
- ✅ Shared libraries as first-class citizens
- ✅ Plugin ecosystem (Next.js, NestJS, React)
- ✅ Dependency graph visualization
- ✅ Code generators for consistency

---

## Final Decision

**Use Nx** as the monorepo tool with:
- `pnpm` as the package manager (disk-efficient, fast)
- Nx Cloud for distributed caching in CI
- `apps/` for deployable applications
- `libs/` for shared code

All new projects are generated via `nx g` generators to maintain consistency.

---

## Consequences

### Positive
- Single `pnpm nx affected:test` runs only affected tests
- Shared `libs/shared/types` eliminates type duplication
- Nx caching makes CI 10x faster after first run
- Consistent tooling across all apps

### Negative / Trade-offs
- Learning curve for Nx for new engineers
- `nx.json` and project config must be maintained
- Large `node_modules` (mitigated by pnpm's symlinking)
- Nx version upgrades require attention

### Rules That Follow From This Decision
- Never run `npm install` or `yarn` — always `pnpm install`
- Always run tasks via `pnpm nx [target] [project]` — not directly
- Shared code goes in `libs/` — never duplicated in `apps/`
- Check `pnpm nx affected:test` before every PR

