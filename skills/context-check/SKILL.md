---
name: context-check
description: Use when a session starts feeling foggy, when the model begins ignoring earlier instructions, or when you want a quick read on context health before continuing. Reports what is taking up the context window and recommends compact / fresh / subagent.
---

# Context Check

A fast health read on the current session's context. Run it the moment things feel off, before you waste another prompt fighting a full window.

## What to do

When invoked, produce a short report — no more than 15 lines — covering:

1. **What's in the window now.** Briefly list the major occupants of the current context: which files have been read in full, large tool outputs, long stretches of conversation, anything pasted in. Estimate roughly which are the heaviest.

2. **Rot risk.** State whether the session is showing the three signals of context rot:
   - instructions from early in the session being dropped
   - re-asking for already-provided information
   - declining output quality mid-task
   Say plainly: low / medium / high.

3. **The recommended move.** Pick exactly one and justify it in one line:
   - **Compact** — long session, still on one task, recent decisions still needed.
   - **Start fresh** — task has changed, or the window is mostly finished work.
   - **Dispatch a subagent** — a heavy one-off read (many files, a big log) is about to happen or is sitting in context.

4. **What to drop.** Name the specific things crowding the window that can safely be cleared.

## Rules

- Keep the report tight. This skill exists to save context, not spend it. Never read additional files to produce the report — reason only over what is already in the session.
- Be specific. "Context is getting full" is useless. "The two log files you read at the start are ~60% of the window and you've already acted on them — drop them" is the point.
- Default bias: when in doubt between compact and fresh, prefer fresh on a task switch and compact mid-task.
