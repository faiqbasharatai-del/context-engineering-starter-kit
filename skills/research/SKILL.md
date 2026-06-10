---
name: research
description: Use when answering a question requires reading many files, a large log, or heavy documentation. Dispatches a subagent to do the reading in its own isolated context and report back only the answer — so the raw bytes never land in your main session and rot it.
---

# Research (isolated read)

This is the highest-leverage move in context engineering: **do the heavy reading somewhere disposable.**

When you need to read forty files, scan a giant log, or comb through docs to answer one question, doing it in your main session dumps all that raw text onto your context window — where it sits and rots everything for the rest of your work. Instead, send a subagent to read it in a separate, throwaway context and return only the conclusion.

## What to do

When invoked with a question:

1. **Dispatch a subagent** (in Claude Code, the Task/subagent tool) to do the reading. Give it:
   - The exact question to answer — narrow, not "tell me about the codebase."
   - The files, directories, or sources it's allowed to read.
   - Read-only tools only. It investigates; it does not edit.

2. **Have it return only the answer.** A tight conclusion plus the handful of `file:line` references that back it up. Not a transcript, not the file contents, not a play-by-play.

3. **Bring back the conclusion, not the corpus.** Your main session receives the 5-line answer. The 40 files stayed in the subagent's context and got thrown away with it.

## Rules

- **Never read the raw material into the main session first.** The entire point is that the bytes never touch your working context. If you find yourself opening the files yourself "just to check," stop and dispatch.
- **One sharp question per dispatch.** A vague brief makes the subagent read everything and report everything — which defeats the purpose. Narrow the question and you narrow what comes back.
- **Trust the boundary.** You don't need the subagent's reasoning trace, only its answer and its citations. If the answer is wrong, re-dispatch with a sharper question rather than pulling the raw files in.

## How this fits with `/context-check`

- `research` is **prevention** — it stops heavy reads from rotting your context in the first place.
- `context-check` is **diagnosis** — it tells you when context has already gone bad and what to do about it.

Use `research` proactively before a big read; reach for `context-check` when a session already feels foggy.
