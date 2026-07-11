# Agent Conventions

This document defines the standards every skill in the OneChoiceKitchen AI framework must follow.

---

## 0. TOKEN / CREDIT EFFICIENCY — HIGHEST PRIORITY RULE

> **Applies to ALL AI tools: Antigravity, Cursor, Codex, Claude, GitHub Copilot, and any other.**

Every AI agent MUST minimize tool calls and file reads. The user pays per token — waste is unacceptable.

### Hard Rules

| Rule | Detail |
|------|--------|
| **Search before reading** | `grep`/`Select-String` to find exact line → then `view_file` with `StartLine`/`EndLine` |
| **One read per file** | Never open the same file twice in one task |
| **Batch edits** | ALL edits to one file → ONE `multi_replace_file_content` call |
| **No full-file reads** | Always use `StartLine`/`EndLine`. Exception: files < 80 lines |
| **No browser tests** | Never run a browser subagent unless user explicitly says "test" or "verify visually" |
| **No plans for simple tasks** | Simple = ≤ 5 file changes. Just do it. No `implementation_plan.md` |
| **No redundant research** | For reverts: screenshot → grep → 1 edit. Never search git log/diff/transcript for a UI revert |
| **Trust your edits** | After making an edit, do NOT re-read the file to confirm it |
| **TypeScript check only when logic changed** | Never run tsc for CSS-only or text-only changes |
| **No intermediate screenshots** | Don't take screenshots mid-task just to see what changed |

### Max Tool Calls Per Task Type

| Task | Max calls |
|------|-----------|
| Revert a UI text/button | 3 |
| Fix one CSS rule | 2 |
| Add hint text to a form section | 3 |
| Fix an API method | 3 |
| New component page | 8 |
| Full new module (DB + API + UI) | 15 |

### Anti-Patterns — NEVER Do These
- ❌ Read 1000-line file when you need 20 lines  
- ❌ Search git log + diff + transcript to revert 2 lines  
- ❌ Run browser subagent after every code change  
- ❌ Create an implementation plan for fixing a button label  
- ❌ Re-read a file after editing it  
- ❌ Run `tsc` after a CSS or text-only change  

---


## 1. Skill Creation Standards

### When to Create a New Skill

Create a new skill when:
- A technology or domain has more than 3 unique guidelines that don't belong in an existing skill
- A recurring workflow needs AI guidance (e.g., a new deployment target)
- A business domain has specific rules that affect code generation

Do NOT create a skill:
- For trivial how-to guides (use references instead)
- For duplicate concerns already covered in an existing skill
- Without at minimum a complete SKILL.md

### Required Folder Structure

```
skill-name/
├── SKILL.md          ← REQUIRED. Must follow the SKILL.md Template below.
├── references/       ← Optional. Detailed reference documents.
├── examples/         ← Optional. Code examples and patterns.
├── templates/        ← Optional. Starter files, boilerplate.
├── checklists/       ← Optional. Procedural checklists.
└── scripts/          ← Optional. Automation scripts.
```

---

## 2. SKILL.md Template

Every SKILL.md must begin with YAML frontmatter:

```yaml
---
name: skill-display-name
description: >
  One or two sentences describing when this skill triggers.
  Use action words: "Use when...", "Activate when...", "Apply when..."
---
```

After frontmatter, include these sections as relevant:

```markdown
# [Skill Name]

## Overview
Brief purpose statement.

## When This Skill Applies
Bullet list of trigger conditions.

## Core Standards / Rules
The main content — guidelines, patterns, requirements.

## Anti-Patterns to Avoid
Things to explicitly NOT do.

## Quality Gates
Validation commands or checks before marking work complete.

## References
Links to reference files in this skill's /references/ folder.
```

---

## 3. Naming Standards

### Skill Folder Names
- All lowercase, hyphen-separated
- Descriptive and domain-specific
- No abbreviations unless universally understood

| ✅ Good | ❌ Bad |
|--------|--------|
| `react-nextjs` | `frontend` |
| `onechoice-business-rules` | `rules` |
| `database-migrations` | `db-mig` |
| `workspace-orchestrator` | `ws` |

### Reference File Names
- Lowercase, hyphen-separated, `.md` extension
- Describe the content, not the format

| ✅ Good | ❌ Bad |
|--------|--------|
| `ports.md` | `port-list.txt` |
| `naming-conventions.md` | `conventions.md` |
| `prisma-patterns.md` | `patterns.md` |

### ADR File Names
- Format: `ADR-NNN-topic.md`
- NNN is zero-padded to 3 digits
- Topic is lowercase, hyphen-separated

---

## 4. Documentation Rules

### SKILL.md Quality Standards
- **Frontmatter is mandatory** — name and description fields must be present
- **Use concrete examples** — avoid abstract descriptions
- **Be prescriptive** — say "DO this" not "you might want to consider"
- **Keep under 500 lines** — use references/ for long content
- **Update when code changes** — skills are not set-and-forget

### Reference File Standards
- One topic per file
- Include version or date sensitivity notes where relevant
- Code examples must be runnable (no pseudocode unless explicitly labeled)

### ADR Standards
Each ADR must have these sections:
1. `# Decision` — one-line decision statement
2. `## Context` — why this decision was needed
3. `## Problem` — the specific problem being solved
4. `## Options Considered` — at least 2-3 alternatives
5. `## Final Decision` — what was chosen and why
6. `## Consequences` — trade-offs, risks, implications

---

## 5. Review Process

### Before Merging a Skill Update

- [ ] SKILL.md frontmatter is present and valid
- [ ] All referenced files in `/references/` exist
- [ ] No content duplicates an existing skill
- [ ] CHANGELOG.md updated with the change
- [ ] VERSION.md patch version bumped
- [ ] Commit message follows: `docs(agents): [action] [skill] - [reason]`

### Commit Message Examples

```
docs(agents): add payments/SKILL.md - Razorpay integration standards
docs(agents): update project-context - added rider-portal app entry
docs(agents): fix testing/SKILL.md - corrected Playwright setup steps
docs(agents): add ADR-008 - deployment strategy decision
```

---

## 6. Responsible Ownership

| Skill Category | Owner |
|----------------|-------|
| project-context | Tech Lead |
| onechoice-business-rules | Product + Tech Lead |
| enterprise-development | Tech Lead |
| testing | QA Lead / Tech Lead |
| deployment | DevOps / Tech Lead |
| domain skills (payments, etc.) | Domain team |
| coding-standards | Tech Lead |
| workspace-orchestrator | DevOps |

---

## 7. Prohibited Practices

- **Do not** hardcode secrets or credentials in any skill file
- **Do not** copy-paste content between skills — use references
- **Do not** create skills without verifying they don't duplicate an existing one
- **Do not** delete skills without confirming no workflows depend on them
- **Do not** commit incomplete SKILL.md files (placeholder content is not acceptable)

