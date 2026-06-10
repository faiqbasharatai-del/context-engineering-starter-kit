# CLAUDE.md — Context-Lean Template

> This file is loaded into the model's context on every single turn. Every line here is rent paid out of your working memory. Keep it short, keep it current, delete what's stale. Treat it like a one-page brief for a new hire, not a wiki.
>
> Delete these `>` notes once you've filled the file in.

## Project

> One or two sentences. What is this, who is it for, what stage is it at. No history, no backstory — just what's true now.

(describe the project)

## Stack & Conventions

> Only the decisions that change how code should be written here. Not a dependency dump — the model can read `package.json`. List the non-obvious rules.

- Language / framework:
- Test command:
- Style rules that aren't enforced by a linter:

## What to do / what not to do

> The handful of standing instructions you find yourself repeating. If you've said it twice, it belongs here.

- Always:
- Never:

## Pointers, not contents

> Do NOT paste large docs, schemas, or logs into this file. Point to where they live. The model reads them on demand — that keeps them out of context until they're actually needed.

- Architecture notes:
- API reference:
- Where decisions are logged:

---

### The rule of thumb

If this file is longer than a screen, it's too long. Length here is not thoroughness — it's noise that crowds out the actual work. Cut ruthlessly.
