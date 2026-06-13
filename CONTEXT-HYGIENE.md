# Context Hygiene

The whole game is keeping the right things on the whiteboard and the wrong things off it. Here are the decision rules. Memorise the three signals and the three moves.

> Don't want to memorise anything? The kit enforces these rules for you: the statusline shows which zone you're in, the read-guard hook blocks the classic mistake, and `/context-check` applies this whole document to your live session. Start with `node .claude/tools/context-audit.cjs` to see what every session already costs you.

## The three signals that rot is setting in

1. The model starts **ignoring instructions** you gave earlier in the session.
2. It **re-asks** for things you already told it, or contradicts a decision you locked.
3. Output quality **drops mid-session** — sloppier code, shallower answers — without the task getting harder.

When you see any of these, the model isn't broken. The context is full. Act.

## The three moves

### 1. Compact — when the session is long but still on one task

You're deep in a feature and the thread is huge, but you still need the recent decisions. Summarise the session down to its essentials and continue. In Claude Code: `/compact`. This clears the noise while keeping the thread of work.

> Rule of thumb: compact when the conversation passes ~50% of the context window, not when it's already failing.

### 2. Start fresh — when you're switching tasks

New task = new whiteboard. Carrying a finished task's context into a new one is pure noise. Close the session, open a clean one, let `CLAUDE.md` re-establish the baseline. The cost of re-establishing context is almost always lower than the cost of dragging stale context along.

### 3. Dispatch a subagent — when the work is heavy and one-off

Reading 40 files to answer one question? Scanning a giant log? Don't do it in your main session — the raw bytes will sit in your context for the rest of the day. Send a subagent to do the reading and report back only the answer. The heavy lifting happens in an isolated context that gets thrown away. Your main session only ever sees the conclusion.

This is the most underused move and the highest-leverage one. Most "my AI got dumber" sessions are really "I read three log files into my context and never cleared them." The `research` skill in this kit does exactly this — point it at the heavy read and it brings back only the answer.

## What to keep OUT of the main window

- Large files you only need one fact from → have a subagent extract the fact.
- Finished work → compact it away.
- Entire docs → point to them in `CLAUDE.md`, load on demand.
- Tool output you've already acted on → it's done its job, let it go.

## The mental model

Context is a **budget**, not a bucket. You are not trying to fill it. You are trying to spend it on the smallest set of tokens that produces the right answer. Every token you don't spend on noise is a token available for reasoning.
