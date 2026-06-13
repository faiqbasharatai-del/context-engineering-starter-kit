#!/usr/bin/env node
/**
 * context-audit — measure the "session tax" of a project.
 *
 * Every Claude Code session silently loads a set of files into the context
 * window before you type a single word: CLAUDE.md, anything it @-imports,
 * every rule file, and the frontmatter of every skill. That is rent you pay
 * out of the model's working memory on EVERY message. This script measures it.
 *
 * Usage:
 *   node context-audit.cjs [projectDir] [--json]
 *
 * Zero dependencies. Node 18+. Token counts are estimates (chars / 4).
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const root = path.resolve(args.find((a) => !a.startsWith("--")) || ".");

const est = (text) => Math.ceil(text.length / 4);
const read = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
};
const rel = (p) => path.relative(root, p).split(path.sep).join("/");

const always = []; // { file, tokens, note }
const onDemand = []; // { file, tokens, note }
const recs = [];

// ---------------------------------------------------------------- memory files
// CLAUDE.md and friends load on every session. So does every file they
// @-import — that's the part almost everyone misses.
const seenImports = new Set();

function addMemoryFile(p, label) {
  const text = read(p);
  if (text === null) return;
  always.push({ file: rel(p), tokens: est(text), note: label });
  collectImports(text, path.dirname(p));
}

function collectImports(text, baseDir) {
  // CLAUDE.md import syntax: a token like @path/to/file.md on its own or inline.
  const re = /(?:^|\s)@([\w~./\\-]+)/g;
  for (const m of text.matchAll(re)) {
    let target = m[1];
    if (target.startsWith("~")) continue; // home-dir imports: out of project scope
    const p = path.resolve(baseDir, target);
    if (seenImports.has(p)) continue;
    seenImports.add(p);
    const imported = read(p);
    if (imported === null) continue; // not a real file (e.g. an email/handle)
    always.push({ file: rel(p), tokens: est(imported), note: "@-imported every session" });
    collectImports(imported, path.dirname(p));
  }
}

addMemoryFile(path.join(root, "CLAUDE.md"), "loaded every session");
addMemoryFile(path.join(root, "CLAUDE.local.md"), "loaded every session");
addMemoryFile(path.join(root, "AGENTS.md"), "loaded every session");

// --------------------------------------------------------------------- rules
const rulesDir = path.join(root, ".claude", "rules");
if (fs.existsSync(rulesDir)) {
  for (const f of fs.readdirSync(rulesDir)) {
    if (!f.endsWith(".md")) continue;
    const p = path.join(rulesDir, f);
    const text = read(p);
    if (text === null) continue;
    always.push({ file: rel(p), tokens: est(text), note: "rule, loaded every session" });
  }
}

// -------------------------------------------------------------------- skills
// Only the frontmatter (name + description) of each skill loads at session
// start; the body loads when the skill is invoked. Long descriptions are a
// hidden per-session tax. Bodies are the GOOD kind of context: on-demand.
const skillDirs = [path.join(root, ".claude", "skills"), path.join(root, "skills")];
let frontmatterTokens = 0;
let skillCount = 0;
for (const dir of skillDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name, "SKILL.md");
    const text = read(p);
    if (text === null) continue;
    skillCount++;
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const head = fm ? fm[1] : "";
    const body = fm ? text.slice(fm[0].length) : text;
    frontmatterTokens += est(head);
    onDemand.push({ file: rel(p), tokens: est(body), note: "skill body, loads on invoke" });
    const desc = head.match(/description:\s*([\s\S]*?)(?:\n\w|$)/);
    if (desc && desc[1].length > 600) {
      recs.push(
        `Skill "${name}": its description is ${desc[1].length} chars. The description is loaded on EVERY session — keep it under ~500 chars and let the body carry the detail.`
      );
    }
  }
}
if (skillCount > 0) {
  always.push({
    file: `skill frontmatter x ${skillCount}`,
    tokens: frontmatterTokens,
    note: "every skill advertises itself every session",
  });
}

// ----------------------------------------------------------------------- mcp
let mcpServers = 0;
const mcp = read(path.join(root, ".mcp.json"));
if (mcp) {
  try {
    mcpServers = Object.keys(JSON.parse(mcp).mcpServers || {}).length;
  } catch {}
}

// -------------------------------------------------------------------- grading
const tax = always.reduce((s, f) => s + f.tokens, 0);
const grade = tax <= 2500 ? "A" : tax <= 5000 ? "B" : tax <= 10000 ? "C" : tax <= 20000 ? "D" : "F";

// ------------------------------------------------------------ recommendations
for (const f of always) {
  if (f.file === "CLAUDE.md" && f.tokens > 800)
    recs.push(
      `CLAUDE.md is ~${f.tokens} tokens. Aim under ~800: keep decisions and standing rules, replace contents with pointers ("architecture notes live in docs/arch.md") — the model reads pointed-to files only when needed.`
    );
  else if (f.note.includes("@-imported") && f.tokens > 600)
    recs.push(
      `${f.file} is @-imported into every session (~${f.tokens} tokens). If it's reference material rather than standing instructions, drop the @-import and point to it instead.`
    );
  else if (f.note.startsWith("rule") && f.tokens > 500)
    recs.push(`${f.file} is a ~${f.tokens}-token rule file. Rules load every session — tighten it.`);
}
if (frontmatterTokens > 1500)
  recs.push(
    `Skill frontmatter alone costs ~${frontmatterTokens} tokens/session across ${skillCount} skills. Merge overlapping skills or shorten descriptions.`
  );
if (mcpServers > 0)
  recs.push(
    `${mcpServers} MCP server(s) configured. Every connected server's tool schemas sit in context for the whole session — disconnect the ones this project doesn't use (check /context inside Claude Code for the real number).`
  );
if (recs.length === 0) recs.push("Lean. Nothing always-loaded is worth cutting — keep it this way.");

// -------------------------------------------------------------------- output
if (asJson) {
  console.log(
    JSON.stringify({ root, sessionTaxTokens: tax, grade, alwaysLoaded: always, onDemand, mcpServers, recommendations: recs }, null, 2)
  );
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n);
const num = (n) => n.toLocaleString("en-GB");
const width = Math.max(40, ...always.concat(onDemand).map((f) => f.file.length + 2));

console.log(`\nCONTEXT AUDIT  ${root}\n`);
console.log("ALWAYS LOADED — the tax you pay on every single message");
for (const f of always) console.log(`  ${pad(f.file, width)} ${pad(num(f.tokens) + " tok", 12)} ${f.note}`);
console.log(`  ${"-".repeat(width + 12)}`);
console.log(`  ${pad("SESSION TAX", width)} ${pad(num(tax) + " tok", 12)} GRADE: ${grade}\n`);
if (onDemand.length) {
  console.log("ON DEMAND — loads only when used (this is the good kind)");
  for (const f of onDemand) console.log(`  ${pad(f.file, width)} ${pad(num(f.tokens) + " tok", 12)} ${f.note}`);
  console.log("");
}
console.log("RECOMMENDATIONS");
recs.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
console.log("\nEstimates use chars/4. For live session usage, run /context inside Claude Code.\n");
