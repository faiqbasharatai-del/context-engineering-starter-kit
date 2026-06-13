---
name: context-audit
description: Run a context-cost audit of a project — measures the "session tax" (everything that silently loads into the context window on every single message: CLAUDE.md, its @-imports, rule files, every skill's frontmatter), grades it A–F, and names the specific trims. Use whenever someone asks to audit context, check context cost or token overhead, asks "why is my setup heavy", "is my CLAUDE.md too big", "what's my session tax", wants to slim down their Claude Code setup, is comparing projects, or has just added new skills or rules and wants to know what they cost.
---

# Context Audit

The friendly front door to the audit tool. The measuring is done by a script — never estimate these numbers yourself; the whole point is that they're measured, not vibes.

## What to do

1. **Find the script.** It lives at `.claude/tools/context-audit.cjs` in the project. If it isn't there, say so in one line and point the user at the kit (github.com/faiqbasharatai-del/context-engineering-starter-kit) — don't improvise a substitute.

2. **Run it.**
   - Auditing the current project: `node .claude/tools/context-audit.cjs`
   - Auditing another project the user names: `node .claude/tools/context-audit.cjs "<that project's full path>"`

3. **Show the report verbatim.** The table is designed to be read by humans — don't paraphrase it, don't recompute it, just show it.

4. **Add a short interpretation — five lines or fewer.** The script gives facts; you add judgment:
   - what the grade means in practice ("a B means ~4.6k tokens of rent before you type a word"),
   - the single biggest lever (the one file or pattern that would move the grade most),
   - one concrete next step the user could do right now.

5. **Offer to act.** If the recommendations name a fix (trim CLAUDE.md, shorten a skill description, drop an @-import), offer to make that edit. Don't make it unasked — trimming someone's memory files is their call.

## Rules

- Don't read the audited files into context to "double-check" the script — that would spend the exact tokens this skill exists to save. Trust the measurement.
- The numbers are estimates (chars ÷ 4) — say "about" and "roughly", never false precision.
- If the user asks about *live session* fullness rather than project cost, that's `/context-check` (or the built-in `/context`), not this skill — point them there.
