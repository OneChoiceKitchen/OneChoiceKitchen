# Refactor Checklist

> **Golden Rule**: A refactor must not change external behavior.
> If tests break, the refactor introduced a regression.

## Pre-Refactor
- [ ] All existing tests pass BEFORE starting refactor
- [ ] Purpose of refactor is clear (performance, readability, DRY, etc.)
- [ ] Scope is limited to the stated purpose

## Refactor
- [ ] No new features added (scope creep avoided)
- [ ] External API contracts unchanged
- [ ] Database schema unchanged (unless explicitly a schema refactor)
- [ ] All existing tests still pass
- [ ] No new test failures introduced

## Post-Refactor
- [ ] Tests passing: `pnpm nx affected:test`
- [ ] Lint passing: `pnpm nx affected:lint`
- [ ] Build passing: `pnpm nx affected:build`
- [ ] Performance not regressed (run benchmarks if applicable)
- [ ] Technical debt removed — not just moved

## Documentation
- [ ] Update comments/JSDoc to reflect new structure
- [ ] If pattern standardized — update `coding-standards` or `enterprise-development`

