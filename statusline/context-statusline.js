#!/usr/bin/env node
/**
 * context-statusline — a live context-rot meter in your status bar.
 *
 * Claude Code pipes session JSON to the statusline command on every update.
 * This script renders one line: how full the context window is, and which
 * zone you're in — so you compact BEFORE the session goes foggy instead of
 * noticing twenty sloppy messages later.
 *
 * Zones follow the kit's hygiene rules (CONTEXT-HYGIENE.md):
 *   < 50%  FRESH          keep working
 *   50-70% COMPACT SOON   wrap the current beat, then /compact
 *   > 70%  ROT RISK       compact or start fresh now
 *
 * Register in .claude/settings.json:
 *   { "statusLine": { "type": "command", "command": "node .claude/statusline/context-statusline.js" } }
 */

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let line = "CTX ?";
  try {
    const s = JSON.parse(raw);
    const model = (s.model && s.model.display_name) || "Claude";
    const cw = s.context_window || {};

    let pct = typeof cw.used_percentage === "number" ? cw.used_percentage : null;
    let used = null;
    let size = cw.context_window_size || 200000;

    if (pct === null && typeof cw.remaining_percentage === "number") pct = 100 - cw.remaining_percentage;

    // Fallback for older versions without context_window: estimate from the
    // transcript file (chars/4 — crude, but honest about being an estimate).
    if (pct === null && s.transcript_path) {
      const fs = require("fs");
      const bytes = fs.statSync(s.transcript_path).size;
      used = Math.round(bytes / 4);
      pct = Math.min(99, Math.round((used / size) * 100));
    }

    if (pct === null) {
      console.log(`${model} | CTX n/a`);
      return;
    }

    pct = Math.max(0, Math.min(100, Math.round(pct)));
    if (used === null) used = Math.round((size * pct) / 100);

    const cells = Math.round(pct / 10);
    const bar = "#".repeat(cells) + "-".repeat(10 - cells);
    const zone = pct < 50 ? "FRESH" : pct < 70 ? "COMPACT SOON" : "ROT RISK";
    const k = (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : String(n));

    line = `${model} | CTX ${k(used)}/${k(size)} ${pct}% [${bar}] ${zone}`;
  } catch {
    /* fall through with the default line */
  }
  console.log(line);
});
