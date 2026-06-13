#!/usr/bin/env node
/**
 * large-read-guard — PreToolUse hook that stops context rot at the door.
 *
 * The single most common way a session rots: the model reads a huge file
 * (a log, a dump, a giant doc) into the main context to answer one question,
 * and those bytes then sit there degrading every message that follows.
 *
 * This hook intercepts Read calls. If the target file is over the limit,
 * the read is denied with a reason that teaches the model the right move:
 * read a slice (offset/limit), search it (Grep), or dispatch the research
 * subagent so the bytes land in a disposable context instead of yours.
 *
 * Register in .claude/settings.json:
 *   { "hooks": { "PreToolUse": [ { "matcher": "Read",
 *     "hooks": [ { "type": "command", "command": "node .claude/hooks/large-read-guard.cjs" } ] } ] } }
 *
 * Tune with env var CONTEXT_GUARD_KB (default 100 — roughly 25k tokens).
 * Fails open: any error allows the read.
 */

const fs = require("fs");
const path = require("path");

// Binary/visual formats are rendered, not dumped as text — let them through.
const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf", ".ipynb"]);

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    if (input.tool_name !== "Read") return process.exit(0);

    const file = input.tool_input && input.tool_input.file_path;
    if (!file) return process.exit(0);

    // A bounded read (offset/limit) is already context-disciplined.
    if (input.tool_input.limit) return process.exit(0);

    if (SKIP_EXT.has(path.extname(file).toLowerCase())) return process.exit(0);

    const limitKb = parseInt(process.env.CONTEXT_GUARD_KB, 10) || 100;
    const size = fs.statSync(file).size;
    if (size <= limitKb * 1024) return process.exit(0);

    const kb = Math.round(size / 1024);
    const tokens = Math.round(size / 4 / 1000);
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason:
            `large-read-guard: ${path.basename(file)} is ~${kb} KB (~${tokens}k tokens). ` +
            `Reading it whole would permanently occupy that much of the context window and rot the rest of this session. ` +
            `Instead: (1) Grep it for the part you need, (2) Read it with offset+limit to take a slice, ` +
            `or (3) use the research skill to dispatch a subagent that reads it in an isolated context and reports back only the answer. ` +
            `If the user explicitly wants the whole file in context, they can raise the limit via the CONTEXT_GUARD_KB env var.`,
        },
      })
    );
    process.exit(0);
  } catch {
    process.exit(0); // fail open — never break a session over a guard
  }
});
