# AI Framework Changelog

All notable changes to the `.agents` AI framework should be documented here.

Format: `[version] - YYYY-MM-DD`

---

## [2.0.0] - 2026-07-09

### Added
- Complete `project-context/SKILL.md` — full OneChoiceKitchen architecture, apps, and modules
- Complete `onechoice-business-rules/SKILL.md` — user journeys, order lifecycle, business rules
- Complete `enterprise-development/SKILL.md` — SOLID, clean architecture, error handling standards
- Complete `testing/SKILL.md` — mandatory test philosophy, RTL, Vitest, Playwright
- Complete `deployment/SKILL.md` — Vercel, VPS/Docker, AWS/Azure/GCP
- Complete `workspace-orchestrator/SKILL.md` — setup.ps1 integration and service management
- Complete `feature-development/SKILL.md` — 10-step development workflow
- Complete `coding-standards/SKILL.md` — TypeScript, React, NestJS, Prisma standards
- Complete `security/SKILL.md` — OWASP, auth, authorization, input validation
- Complete `performance/SKILL.md` — lazy loading, caching, DB optimization
- Complete `accessibility/SKILL.md` — WCAG 2.1 AA compliance standards
- Complete `api-design/SKILL.md` — RESTful and GraphQL API standards
- Complete `code-review/SKILL.md` — review process and quality gates
- Complete `postgres/SKILL.md` — PostgreSQL patterns and optimization
- Complete `redis/SKILL.md` — caching patterns and queue management
- Complete `react-nextjs/SKILL.md` — Next.js app router patterns
- Complete `docker/SKILL.md` — containerization standards
- Complete `documentation/SKILL.md` — doc requirements
- Complete `git-workflow/SKILL.md` — branching, commits, PR process
- Complete `logging-monitoring/SKILL.md` — structured logging, alerting
- Complete `maps-location/SKILL.md` — Google Maps, geolocation, delivery tracking
- Complete `notifications/SKILL.md` — push, email, SMS, in-app notifications
- Complete `payments/SKILL.md` — Razorpay, Stripe integration patterns
- Complete `production-readiness/SKILL.md` — launch checklist
- Complete `release-management/SKILL.md` — semantic versioning, release process
- Complete `troubleshooting/SKILL.md` — debug patterns and runbooks
- Complete `ui-ux/SKILL.md` — design principles and UX standards
- Complete `database-migrations/SKILL.md` — Prisma migration strategy
- All ADRs (001–007) written with full context, options, decisions, consequences
- Root governance docs: README.md, VERSION.md, AGENT-CONVENTIONS.md
- `workspace-orchestrator/references/ports.md` — all service ports documented
- `workspace-orchestrator/references/profiles.md` — startup profiles documented
- `feature-development` checklists: feature.md, bugfix.md, refactor.md

### Fixed
- Empty SKILL.md files across all 36 skills
- Missing SKILL.md in onechoice-business-rules, coding-standards, git-workflow, etc.
- Empty root governance documents

---

## [1.0.0] - 2026-07-01

### Added
- Initial `.agents/skills/` folder structure created
- 36 skill directories stubbed out
- ADR directory created with 7 empty ADR files
- Workspace orchestrator setup.ps1 script added

