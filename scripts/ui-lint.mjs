import { readFileSync, readdirSync } from "fs";
import { basename } from "path";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// .agents/skills e a fonte da verdade para nodes e enums validos
const SK = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".agents", "skills");

// nodes validos = nomes dos arquivos em skills/elements/ + containers do jogo
const NODES = new Set(readdirSync(`${SK}/elements`)
  .filter(f => f.endsWith(".md") && !/^(README|SKILL)\.md$/.test(f))
  .map(f => basename(f, ".md").toLowerCase()));
["group","label","panel","button","textbutton","progressbar","itemgrid",
 "playerpreviewcomponent","sprite"].forEach(n => NODES.add(n));

// enums validos, extraidos das tabelas markdown de skills/enums/
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

  for (const [o,c,n] of [["{","}","chaves"],["(",")","parenteses"]]) {
    let d=0; for (const ch of ns){ if(ch===o)d++; else if(ch===c)d--; if(d<0)break; }
    if (d!==0) e.push(`${n} desbalanceadas (${d})`);
  }

  if (/\d\s*%/.test(ns))                        e.push("GOTCHA: porcentagem");
  if (/^\s*[a-z]+-[a-z]+\s*:/m.test(ns))        e.push("GOTCHA: kebab-case");
  if (/^\s*Margin\s*:/m.test(ns))               e.push("GOTCHA: propriedade Margin");
  if (/:\s*auto\b/.test(ns))                    e.push("GOTCHA: valor 'auto'");
  if (/\\n/.test(code))                         e.push("GOTCHA: escape \\n");

  for (const m of ns.matchAll(/LayoutMode\s*:\s*(\w+)/g))
    if (!LM.has(m[1])) e.push(`LayoutMode invalido: '${m[1]}'`);
  for (const m of ns.matchAll(/(?:Horizontal|Vertical)Alignment\s*:\s*(\w+)/g))
    if (!LA.has(m[1])) e.push(`Alignment invalido: '${m[1]}' (use Start/Center/End)`);
  for (const m of ns.matchAll(/^\s*([A-Z]\w*)\s*(?:#\w+\s*)?\{/gm))
    if (!NODES.has(m[1].toLowerCase())) e.push(`node desconhecido: ${m[1]}`);

  // ';' obrigatorio, mas so no nivel 0 de parenteses
  let depth = 0;
  ns.split("\n").forEach((ln, i) => {
    const t = ln.trim();
    if (depth === 0 && /^[A-Z]\w*\s*:/.test(t) && !t.endsWith(";") && !t.endsWith("("))
      e.push(`linha ${i+1}: falta ';' -> ${t.slice(0,50)}`);
    depth += (ln.split("(").length-1) - (ln.split(")").length-1);
  });


  // ';' obrigatorio tambem em declaracoes @Nome = valor  (nivel 0 de parenteses)
  let pd = 0;
  ns.split("\n").forEach((ln, i) => {
    const t = ln.trim();
    if (pd === 0 && /^@\w+\s*=/.test(t) && !/[;({,[]$/.test(t))
      e.push(`linha ${i+1}: falta ';' na expressao -> ${t.slice(0,50)}`);
    pd += (ln.split("(").length-1) - (ln.split(")").length-1);
  });

  const u = [...new Set(e)];
  console.log(u.length ? `FAIL ${f}\n      ${u.join("\n      ")}` : `OK   ${f}`);
  bad += u.length ? 1 : 0;
}
console.log(bad ? `\n>>> ${bad} com problema` : "\n>>> TUDO LIMPO");
