---
name: context-check
description: Use when a session starts feeling foggy, when the model begins ignoring earlier instructions, or when you want a quick read on context health before continuing. Combines hard numbers from the context-audit tool with a judgment read of the current session, then recommends compact / fresh / subagent.
---

# Context Check

A fast health read on the current session's context. Run it the moment things feel off, before you waste another prompt fighting a full window. The report has two halves: **measured facts** (from the audit tool) and **session judgment** (reasoning over what's actually in the window right now).

## What to do

When invoked, produce a short report — no more than 20 lines — covering:

1. **The measured tax (run the tool).** If `.claude/tools/context-audit.js` exists in the project, run:
   ```
   node .claude/tools/context-audit.js --json
   ```
   Report the session-tax grade and the single biggest always-loaded offender. This is the *static* cost — what every message pays before the conversation even starts. If the tool isn't installed, say so in one line and skip to step 2.

2. **What's in the window now (judgment).** Briefly list the major occupants of the current session: files read in full, large tool outputs, long stretches of conversation, anything pasted in. Name the heaviest ones specifically.

3. **Rot risk.** State whether the session shows the three signals of context rot — dropped instructions, re-asking for known information, declining output quality — and rate it plainly: low / medium / high.

4. **The recommended move.** Pick exactly one and justify it in one line:
   - **Compact** — long session, still on one task, recent decisions still needed.
   - **Start fresh** — task has changed, or the window is mostly finished work.
   - **Dispatch a subagent** (the `research` skill) — a heavy one-off read is about to happen or is already sitting in context.

5. **What to drop.** Name the specific things crowding the window that can safely be cleared — and if the static tax graded C or worse, the one file to trim so every future session starts cheaper.

## Rules

- Keep the report tight. This skill exists to save context, not spend it. The audit tool is the ONLY thing you may run — never read additional files to produce the report; reason over what is already in the session.
- Be specific. "Context is getting full" is useless. "The 40 KB log you read at message 12 is ~10k tokens and you've already acted on it — compact it away" is the point.
- Default bias: when in doubt between compact and fresh, prefer fresh on a task switch and compact mid-task.
- If the `large-read-guard` hook denied a read this session, treat that as a high-signal event: recommend the `research` skill for that file explicitly.
