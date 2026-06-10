# Memory File Template

Persistent memory is how you keep facts across sessions **without** carrying a full conversation forward. One file = one fact. Cheap to load, easy to search, easy to delete when wrong.

Copy the block below into a new file under your memory directory. One fact per file. Keep the body to a few lines.

```markdown
---
name: <short-kebab-case-slug>
description: <one-line summary — this is what gets scanned to decide if the fact is relevant>
type: project | preference | reference | decision
---

<The fact, stated plainly. A few lines at most.>

<For decisions, add why it was made. For references, add where the thing lives.>
```

## Rules

- **One fact per file.** A file that holds five facts can't be recalled or retired cleanly.
- **The description is the index.** Write it so a future session can tell, from that one line, whether to load the file. Vague descriptions never get recalled.
- **Delete what's wrong.** A stale memory is worse than no memory — it actively misleads. When a fact changes, update or delete the file.
- **Don't store what the code already says.** Memory is for what isn't derivable from the repo: decisions, preferences, context. Not structure the model can read for itself.
