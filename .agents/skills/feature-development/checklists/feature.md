# Feature Development Checklist

Use this checklist for all new feature PRs.

## Understanding & Design
- [ ] Requirement fully understood and clarified
- [ ] Business rules checked (no violations)
- [ ] API contract defined before implementation
- [ ] Database schema changes planned
- [ ] ADR created (if architectural decision made)

## Implementation
- [ ] TypeScript types defined in shared library
- [ ] Database migration created (if schema changed)
- [ ] Prisma client regenerated
- [ ] DTO created with class-validator decorators
- [ ] Service methods implemented with error handling
- [ ] Controller endpoints with Swagger decorators
- [ ] Frontend components created following design system
- [ ] API client / hooks wired up
- [ ] Loading and error states handled

## Testing
- [ ] Unit tests written for all service methods
- [ ] Unit tests written for all components
- [ ] E2E test written for critical user flow
- [ ] All tests passing: `pnpm nx affected:test`

## Quality Gates
- [ ] Lint passes: `pnpm nx affected:lint`
- [ ] Build passes: `pnpm nx affected:build`
- [ ] TypeScript strict mode passes — no `any` without justification
- [ ] No `console.log` in production code

## Security
- [ ] New API endpoints have authentication guards
- [ ] Input validation on all DTOs
- [ ] Authorization (RBAC) checked
- [ ] No PII logged
- [ ] No secrets hardcoded

## Documentation
- [ ] Swagger/OpenAPI updated
- [ ] `.env.example` updated if new vars added
- [ ] Skill docs updated if business rules changed
- [ ] CHANGELOG updated if applicable

## Accessibility (UI features)
- [ ] ARIA roles and labels added
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader tested

