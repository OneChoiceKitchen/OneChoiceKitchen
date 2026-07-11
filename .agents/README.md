# OneChoiceKitchen — AI Agent Framework

> **Version**: 2.0.0 | **Status**: Production-Ready | **Maintained by**: Engineering Team

---

## Purpose

The `.agents/` directory is the **enterprise AI knowledge system** for the OneChoiceKitchen Nx monorepo. It teaches Antigravity (the AI coding assistant) everything it needs to know about this specific project — its architecture, business rules, coding standards, workflows, and conventions — so every generated code change is production-ready on the first pass.

This is **not** a generic AI prompt folder. It is a **living technical documentation system** that grows with the product.

---

## How Antigravity Uses Skills

When you invoke Antigravity on any task, it:

1. **Loads project-context** first — understands what OneChoiceKitchen is
2. **Loads onechoice-business-rules** — understands domain constraints
3. **Loads enterprise-development** — applies coding standards
4. **Loads the relevant domain skill** (e.g., `payments`, `notifications`, `testing`)
5. **Executes the task** in alignment with all loaded skills

### Skill Loading Priority (Highest → Lowest)

| Priority | Skill | Reason |
|----------|-------|--------|
| 1 | `project-context` | Sets the full technical landscape |
| 2 | `onechoice-business-rules` | Prevents domain logic errors |
| 3 | `enterprise-development` | Enforces code quality standards |
| 4 | `coding-standards` | Enforces naming and structure |
| 5 | Domain skill | Feature-specific guidance |
| 6 | Tool skill (nx-*, docker, etc.) | Toolchain guidance |

---

## Project Development Workflow

```
1. Feature Request
        ↓
2. Load: project-context + business-rules
        ↓
3. Load: feature-development workflow
        ↓
4. Design Solution (ADR if architectural)
        ↓
5. Write Tests First (testing skill)
        ↓
6. Implement (domain skill + coding-standards)
        ↓
7. Quality Gate: pnpm nx affected:test && lint && build
        ↓
8. Security Review (security skill)
        ↓
9. Documentation Update (documentation skill)
        ↓
10. Deployment (deployment skill)
```

---

## Skill Directory Structure

```
.agents/
├── README.md                    # This file
├── VERSION.md                   # Framework version tracking
├── CHANGELOG.md                 # History of framework changes
├── AGENT-CONVENTIONS.md         # How to create and maintain skills
├── SKILL.md                     # Root skill (auto-loaded by Antigravity)
│
├── adr/                         # Architecture Decision Records
│   ├── ADR-001-monorepo.md
│   └── ...
│
└── skills/                      # Domain and tool skills
    ├── project-context/         # ← ALWAYS LOAD FIRST
    ├── onechoice-business-rules/# ← ALWAYS LOAD SECOND
    ├── enterprise-development/  # ← Core quality standards
    ├── coding-standards/        # TypeScript, React, NestJS patterns
    ├── feature-development/     # End-to-end feature workflow
    ├── testing/                 # Mandatory test standards
    ├── deployment/              # Vercel + VPS + Cloud
    ├── workspace-orchestrator/  # setup.ps1 + service management
    └── [domain skills]/         # payments, notifications, etc.
```

---

## How Developers Should Update Skills

### When to Update a Skill

- A new architectural decision is made → create/update ADR + skill
- A new business rule is added → update `onechoice-business-rules`
- A new port is assigned → update `workspace-orchestrator/references/ports.md`
- A coding standard is established → update `coding-standards`
- A new application is added → update `project-context` + `setup.ps1`

### Update Process

1. Edit the relevant SKILL.md or reference file
2. Update `CHANGELOG.md` with what changed and why
3. Bump `VERSION.md` patch version
4. Commit with message: `docs(agents): update [skill-name] - [reason]`

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `skills/project-context/SKILL.md` | Full OneChoiceKitchen architecture overview |
| `skills/onechoice-business-rules/SKILL.md` | Domain rules — order lifecycle, pricing, etc. |
| `skills/workspace-orchestrator/references/ports.md` | All service ports |
| `skills/workspace-orchestrator/references/profiles.md` | Startup profiles |
| `skills/workspace-orchestrator/setup.ps1` | Master startup/shutdown script |
| `adr/` | Why key technical decisions were made |

