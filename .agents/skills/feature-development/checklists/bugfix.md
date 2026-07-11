# Bug Fix Checklist

## Investigation
- [ ] Root cause identified (not just symptom fixed)
- [ ] Reproduction steps documented
- [ ] Affected users/environments identified
- [ ] Is this a regression? (identify which commit introduced it)

## Fix
- [ ] Fix targets root cause, not symptom
- [ ] No unintended side effects introduced
- [ ] Edge cases handled

## Testing
- [ ] Regression test written (so it can't happen again)
- [ ] Original reproduction steps no longer trigger the bug
- [ ] Tests passing: `pnpm nx affected:test`
- [ ] Lint passing: `pnpm nx affected:lint`
- [ ] Build passing: `pnpm nx affected:build`

## Documentation
- [ ] If business rule was wrong — update `onechoice-business-rules`
- [ ] If recurring pattern — add to `troubleshooting` skill
- [ ] CHANGELOG updated

