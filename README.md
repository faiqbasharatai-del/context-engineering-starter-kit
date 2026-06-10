# Context Engineering Starter Kit

If your AI assistant feels like it got dumber, it probably didn't. Your **context** did.

This is a small, opinionated kit for keeping AI coding assistants (Claude Code, Cursor, and anything that reads a `CLAUDE.md`) sharp across long sessions. It's the setup I use to stop the slow drift where the model starts ignoring your instructions, forgetting decisions, and writing sloppier code the longer you work.

No magic. Just context discipline that almost nobody applies.

---

## Why your AI "feels worse"

Four things cause it, and only one of them is the model's fault:

1. **Context rot.** The longer a conversation runs, the worse the model recalls what happened early on. Attention weights recent tokens; the stuff from 30 messages ago quietly drops out. This is the big one, and it's the one you can fix.
2. **Product-layer changes.** Defaults, caching, verbosity caps in the *app* shift over time. These get patched. Not your problem to manage.
3. **Infrastructure.** Mixed hardware and quantization across a provider's fleet can cause intermittent quality dips. Documented, real, out of your hands.
4. **You.** You got used to how good it is, your prompts got lazier, and your tasks got harder. Honest, but true.

You can't fix 2, 3, or 4. You can fix 1 completely. That's what this kit is for.

> Sources worth reading: Anthropic's [postmortem of three recent issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues) and [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

---

## The one idea

**The context window is working memory, not a hard drive.** It's a whiteboard, not a filing cabinet. Everything the model can "see" right now — your files, the conversation, tool outputs, instructions — competes for the same finite space. Fill it with noise and the signal gets buried.

Context engineering is the discipline of curating what's on the whiteboard at any moment. Three moves:

- **Keep it lean** — a tight `CLAUDE.md`, not a novel.
- **Keep it fresh** — compact or restart before rot sets in.
- **Keep it isolated** — push heavy, one-off work into subagents and skills so it never pollutes your main session.

---

## What's in the kit

| File | What it does |
|------|--------------|
| `CLAUDE.md` | An annotated, context-lean memory template. Copy it, fill it in, delete the notes. |
| `CONTEXT-HYGIENE.md` | The decision rules: when to compact, when to start fresh, when to dispatch a subagent. |
| `skills/context-check/SKILL.md` | A `/context-check` routine that reads your current session and flags bloat before it bites. |
| `templates/memory-template.md` | A single-fact memory file format for persistent, low-cost recall across sessions. |

---

## Install

Drop these into the root of any project Claude Code opens:

```bash
git clone https://github.com/USERNAME/context-engineering-starter-kit.git
cp context-engineering-starter-kit/CLAUDE.md ./CLAUDE.md
cp -r context-engineering-starter-kit/skills ./.claude/skills
```

Then open the project with Claude Code and run `/context-check` whenever a session starts feeling foggy.

---

## License

MIT. Use it, fork it, ship it.
