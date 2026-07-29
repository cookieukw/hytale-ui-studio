// Valida "propriedade X existe no no do tipo Y".
// Fonte da verdade = propriedades documentadas em .agents/skills/elements/*.md
// UNIAO com as observadas no corpus original do jogo. A uniao evita falso
// positivo onde a doc tem buraco (ex: Scale em PlayerPreviewComponent).
import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SK = join(ROOT, ".agents", "skills", "elements");

const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith(".ui") ? [p] : []);
});

// --- tokenizador de blocos: devolve [{type, prop, line}] ---
function scan(src) {
  const out = [];
  const stack = [];
  let pd = 0;
  src.split("\n").forEach((raw, i) => {
    const ln = raw.replace(/\/\/.*$/, "").replace(/"[^"]*"/g, '""');
    const t = ln.trim();
    if (pd === 0) {
      const m = t.match(/^([A-Z]\w*)\s*(?:#\w+)?\s*\{/)
             || t.match(/^@\w+\s*=\s*([A-Z]\w*)\s*\{/);
      if (m) stack.push(m[1]);
      else if (/^(@\w+|\$[\w.@]+)\s*(?:#\w+)?\s*\{/.test(t)) stack.push(null);
      else if (stack.length && stack[stack.length-1]) {
        // varias propriedades podem estar na mesma linha separadas por ';'
        for (const p of t.matchAll(/(?:^|;)\s*([A-Z]\w*)\s*:/g))
          out.push({ type: stack[stack.length-1], prop: p[1], line: i+1 });
      }
    }
    pd += (ln.split("(").length-1) - (ln.split(")").length-1);
    for (let k = 0; k < (ln.split("}").length-1); k++) stack.pop();
  });
  return out;
}

// --- 1. propriedades documentadas ---
const allowed = new Map();
const add = (t, p) => {
  const k = t.toLowerCase();
  if (!allowed.has(k)) allowed.set(k, new Set());
  allowed.get(k).add(p);
};
for (const f of readdirSync(SK).filter(f => f.endsWith(".md") && !/^(README|SKILL)\.md$/.test(f))) {
  const type = basename(f, ".md");
  for (const m of readFileSync(join(SK, f), "utf8").matchAll(/^\|\s*\*\*(\w+)\*\*/gm)) add(type, m[1]);
}

// --- 2. propriedades observadas no corpus original ---
const corpus = process.argv[2];
let nFiles = 0;
for (const f of walk(corpus)) {
  nFiles++;
  for (const { type, prop } of scan(readFileSync(f, "utf8"))) add(type, prop);
}
console.log(`baseline: ${nFiles} arquivos originais, ${allowed.size} tipos de no\n`);

// --- 3. valida os alvos ---
let bad = 0;
for (const f of process.argv.slice(3)) {
  const errs = [];
  for (const { type, prop, line } of scan(readFileSync(f, "utf8"))) {
    const set = allowed.get(type.toLowerCase());
    if (set && !set.has(prop))
      errs.push(`linha ${line}: propriedade '${prop}' nao existe em '${type}'`);
  }
  if (errs.length) { console.log(`FAIL ${f}\n      ${errs.join("\n      ")}`); bad++; }
  else console.log(`OK   ${f}`);
}
console.log(bad ? `\n>>> ${bad} com problema` : "\n>>> TUDO LIMPO");
