---
name: git-workflow
description: >
  Git branching strategy, commit conventions, and PR process for OneChoiceKitchen.
  Use when creating branches, writing commits, or preparing pull requests.
---

# Git Workflow

## Branching Strategy (Trunk-Based + Feature Branches)

`
main          ← Production branch, always deployable
  └── develop ← Integration branch (staging)
       └── feature/OCK-123-add-subscription-pause
       └── fix/OCK-456-order-cancellation-bug
       └── chore/update-dependencies
`

### Branch Naming
<type>/<ticket-id>-<short-description>

| Type | When |
|------|------|
| eature/ | New features |
| ix/ | Bug fixes |
| hotfix/ | Critical production fixes (branch from main) |
| chore/ | Maintenance, dependency updates |
| docs/ | Documentation only |
| efactor/ | Code cleanup without feature change |

## Commit Message Convention (Conventional Commits)

`
<type>(<scope>): <short description>

[optional body]
[optional footer: BREAKING CHANGE or Refs]
`

### Types
| Type | When |
|------|------|
| eat | New feature |
| ix | Bug fix |
| docs | Documentation |
| style | Formatting (no logic change) |
| efactor | Code restructure (no feature/fix) |
| 	est | Adding tests |
| chore | Build, CI, tooling |
| perf | Performance improvement |

### Examples
`
feat(orders): add delivery notes to order placement
fix(cart): prevent negative item quantities
docs(agents): update onechoice-business-rules with cancellation policy
chore(deps): update Prisma to v5.5.0
test(auth): add refresh token rotation tests
refactor(restaurants): extract menu caching to repository
`

## Pull Request Process

1. **Create PR** from feature branch → develop
2. **PR Title** follows commit convention: eat(orders): add subscription pause
3. **PR Description** includes:
   - What changed and why
   - Screenshots for UI changes
   - Testing steps
   - Checklist from eature-development/checklists/feature.md
4. **CI must pass** before review: Nx Cloud shows affected tests
5. **Code review**: minimum 1 approval from another engineer
6. **Squash merge** into develop to keep clean history

## Hotfix Process

`
1. Branch from main: hotfix/OCK-789-payment-double-charge
2. Fix and test
3. PR to main (fast approval)
4. Merge to main AND develop
5. Tag the release
`

## Do Not
- Never force-push to main or develop
- Never commit directly to main
- Never leave WIP commits in a PR (squash them)
- Never commit secrets or .env files
