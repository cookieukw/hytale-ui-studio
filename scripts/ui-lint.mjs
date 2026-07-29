import { readFileSync, readdirSync } from "fs";
import { basename } from "path";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// public/custom-ui/type-documentation is the source of truth for valid
// nodes and enums. It is versioned with the repo, unlike a scratch folder.
const SK = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public", "custom-ui", "type-documentation");

// Valid nodes = filenames under skills/elements/ plus containers used by the game
const NODES = new Set(readdirSync(`${SK}/elements`)
  .filter(f => f.endsWith(".md") && !/^(README|SKILL)\.md$/.test(f))
  .map(f => basename(f, ".md").toLowerCase()));
["group","label","panel","button","textbutton","progressbar","itemgrid",
 "playerpreviewcomponent","sprite"].forEach(n => NODES.add(n));

// Valid enum values, extracted from the markdown tables in skills/enums/
function enumVals(file) {
  const t = readFileSync(`${SK}/enums/${file}`, "utf8");
  return new Set([...t.matchAll(/^\|\s*\*\*(\w+)\*\*/gm)].map(m => m[1]));
}
const LM = enumVals("layoutmode.md");
const LA = enumVals("labelalignment.md");

let bad = 0;
for (const f of process.argv.slice(2)) {
  const src = readFileSync(f, "utf8");
  const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const ns = code.replace(/"[^"]*"/g, '""');
  const e = [];

  for (const [o,c,n] of [["{","}","braces"],["(",")","parentheses"]]) {
    let d=0; for (const ch of ns){ if(ch===o)d++; else if(ch===c)d--; if(d<0)break; }
    if (d!==0) e.push(`${n} desbalanceadas (${d})`);
  }

  if (/\d\s*%/.test(ns))                        e.push("GOTCHA: percentage value");
  if (/^\s*[a-z]+-[a-z]+\s*:/m.test(ns))        e.push("GOTCHA: kebab-case property (CSS)");
  if (/^\s*Margin\s*:/m.test(ns))               e.push("GOTCHA: Margin property does not exist");
  if (/:\s*auto\b/.test(ns))                    e.push("GOTCHA: 'auto' value (CSS)");
  if (/\\n/.test(code))                         e.push("GOTCHA: \\n escape in string");

  for (const m of ns.matchAll(/LayoutMode\s*:\s*(\w+)/g))
    if (!LM.has(m[1])) e.push(`invalid LayoutMode: '${m[1]}'`);
  for (const m of ns.matchAll(/(?:Horizontal|Vertical)Alignment\s*:\s*(\w+)/g))
    if (!LA.has(m[1])) e.push(`invalid Alignment: '${m[1]}' (use Start/Center/End)`);
  for (const m of ns.matchAll(/^\s*([A-Z]\w*)\s*(?:#\w+\s*)?\{/gm))
    if (!NODES.has(m[1].toLowerCase())) e.push(`unknown node type: ${m[1]}`);

  // Semicolon required, but only at paren depth 0
  let depth = 0;
  ns.split("\n").forEach((ln, i) => {
    const t = ln.trim();
    if (depth === 0 && /^[A-Z]\w*\s*:/.test(t) && !t.endsWith(";") && !t.endsWith("("))
      e.push(`linha ${i+1}: missing ';' -> ${t.slice(0,50)}`);
    depth += (ln.split("(").length-1) - (ln.split(")").length-1);
  });


  // Semicolon also required on `@Name = value` declarations (paren depth 0)
  let pd = 0;
  ns.split("\n").forEach((ln, i) => {
    const t = ln.trim();
    if (pd === 0 && /^@\w+\s*=/.test(t) && !/[;({,[]$/.test(t))
      e.push(`linha ${i+1}: missing ';' on expression -> ${t.slice(0,50)}`);
    pd += (ln.split("(").length-1) - (ln.split(")").length-1);
  });

  const u = [...new Set(e)];
  console.log(u.length ? `FAIL ${f}\n      ${u.join("\n      ")}` : `OK   ${f}`);
  bad += u.length ? 1 : 0;
}
console.log(bad ? `\n>>> ${bad} file(s) with problems` : "\n>>> ALL CLEAN");
