---
name: token-efficiency
description: >
  MANDATORY token/credit efficiency rules for ALL AI tools (Antigravity, Cursor, Codex,
  Claude, Copilot). Apply on EVERY task. Minimise tool calls, file reads, and searches.
  Never read what you don't need. Never run browser tests without explicit user request.
  Always batch edits. Never create plans for simple tasks.
---

# Token Efficiency — Universal Rules for All AI Tools

> **APPLIES TO:** Antigravity, Cursor, Codex, Claude, GitHub Copilot, and any other AI tool.
> **PRIORITY:** Highest — these rules override default agent behavior.

---

## The Golden Rules

### 1. Search Before Reading
- Use `grep`/`Select-String`/`ripgrep` to find the EXACT line number before `view_file`
- Never read an entire file when you only need 10 lines
- `view_file` with `StartLine`/`EndLine` always — never open full files

### 2. One Read Per File Per Task
- Read each file at most ONCE per task
- Cache what you read mentally — never re-read the same file
- If you need a second look, use grep on the specific term

### 3. Batch All Edits to Same File
- NEVER make multiple separate edits to the same file
- Use `multi_replace_file_content` for all non-contiguous edits in ONE call
- Plan all changes before touching the file

### 4. No Browser Tests Unless Explicitly Asked
- NEVER run a browser subagent unless the user says "test", "check in browser", "verify visually"
- Browser subagents cost enormous tokens — save them for explicit user requests

### 5. No Plans for Simple Tasks
- Simple = fixing a button text, adding a class, changing a color, reverting a line
- For simple tasks: read the minimum, make the change, done
- Only create `implementation_plan.md` for multi-file architectural changes

### 6. No Redundant Research
- For UI reverts: look at the SCREENSHOT the user shared first, then check current code, make 1 edit
- For bug fixes: grep for the error/function, read 20 lines around it, fix it
- Never check git log, git diff, git stash, transcript, multiple screenshots just to revert 2 lines

### 7. Minimal Tool Chain for Each Task Type

| Task Type | Max Tool Calls |
|-----------|----------------|
| Revert a UI text/button | 2 (grep → replace) |
| Fix a CSS bug | 2 (grep → replace) |
| Add hint text to a form | 3 (grep → view 30 lines → replace) |
| Fix an API 500 error | 3 (view service → view controller → replace) |
| Add new page/route | 5 (view nav → view route → write file → 2 edits) |
| Full feature (new module) | Plan first, then ≤15 |

### 8. TypeScript Check — Only When Logic Changed
- Run `tsc --noEmit` only when you added/changed TypeScript logic
- NEVER run it for CSS-only or text-only changes

### 9. Never Re-check What Was Just Changed
- After making an edit, trust it was applied correctly
- Don't re-read the file to verify the change

### 10. Use the User's Screenshot First
- When user shares a screenshot showing an issue or desired state
- READ THE SCREENSHOT → identify exactly what needs changing → grep for it → 1 edit
- Total: 3 tool calls maximum for any screenshot-guided task

---

## Anti-Patterns — NEVER Do These

```
❌ Read entire file (1000+ lines) when you need 20 lines
❌ Run git log + git diff + git stash to find a 2-line revert
❌ Open transcript.jsonl to find what text was in a button
❌ Take multiple screenshots to verify a text change
❌ Make 3 separate edits to the same file
❌ Run browser subagent after every code change
❌ Create implementation plan for tasks under 5 files
❌ Run TypeScript check after a CSS change
❌ Read the same file twice in one task
❌ Search 5 different places when 1 grep would answer it
```

---

## Quick Reference — Efficient Patterns

### Revert a UI element to original state
```
1. grep for the element text/class (1 call)
2. view_file 10 lines around it (1 call)  
3. replace_file_content (1 call)
Total: 3 calls
```

### Fix a form label
```
1. grep for the label text (1 call)
2. replace_file_content inline (1 call)
Total: 2 calls
```

### Add hint text to multiple fields in one file
```
1. grep to find line numbers of all labels (1 call)
2. view_file the section (1 call)
3. multi_replace_file_content all at once (1 call)
Total: 3 calls
```

### Fix API 500 error
```
1. view service file (1 call, full file if < 200 lines)
2. replace_file_content the broken method (1 call)
Total: 2 calls
```

---

## Skill Update Requirement

When the user says "update your skills" about any behavior:
1. Identify which skill file to update (max 1-2 files)
2. Add the rule in ≤ 10 lines
3. Done — no need to read other skills, no need for a plan
