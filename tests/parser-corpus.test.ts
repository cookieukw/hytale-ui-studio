import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { parseAndMapCode } from "../lib/hytale-parser";

/**
 * Suite de paridade contra os arquivos .ui reais do cliente Hytale.
 *
 * Nenhum arquivo da Hypixel e versionado neste repositorio. O corpus e lido de
 * um caminho apontado pela variavel de ambiente HYTALE_UI_CORPUS. Sem ela, os
 * testes sao pulados — entao o build continua verde para quem nao tem o jogo.
 *
 *   HYTALE_UI_CORPUS=/caminho/para/Client/Data/Game/Interface pnpm test
 *
 * Por que isso existe: o corpus e um oraculo gratuito. Se o parser falhar num
 * arquivo escrito pelos proprios devs do jogo, o errado e o parser.
 */

const CORPUS = process.env.HYTALE_UI_CORPUS;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".ui") ? [p] : [];
  });
}

const available = Boolean(CORPUS && existsSync(CORPUS));
const suite = available ? describe : describe.skip;

suite("paridade com o corpus real do Hytale", () => {
  const files = available ? walk(CORPUS!) : [];

  it("encontra arquivos .ui no corpus", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("parseia todo arquivo .ui sem lancar", () => {
    const falhas: string[] = [];
    for (const f of files) {
      try {
        parseAndMapCode(readFileSync(f, "utf8"));
      } catch (e) {
        falhas.push(`${f.replace(CORPUS!, "")}: ${(e as Error).message}`);
      }
    }
    expect(falhas).toEqual([]);
  });

  it("nao produz arquivo vazio quando ha blocos de elemento", () => {
    // Um arquivo com `Node { ... }` no fonte precisa render componentes ou
    // templates. Zero para ambos significa que o parser nao entendeu nada —
    // foi exatamente o caso das bibliotecas de template antes do suporte a
    // `@Nome = Node { ... };`.
    const vazios: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const blocos = (
        src.replace(/\/\/.*$/gm, "").match(/^\s*[A-Z]\w*\s*(#\w+)?\s*\{/gm) || []
      ).length;
      if (blocos === 0) continue;

      const { components, templates } = parseAndMapCode(src);
      if (components.length === 0 && templates.length === 0) {
        vazios.push(`${f.replace(CORPUS!, "")} (${blocos} blocos)`);
      }
    }
    expect(vazios).toEqual([]);
  });

  it("materializa bibliotecas de template", () => {
    // Arquivos que so declaram `@Nome = Node { ... };` devem expor templates.
    const comTemplates = files.filter(
      (f) => parseAndMapCode(readFileSync(f, "utf8")).templates.length > 0,
    );
    expect(comTemplates.length).toBeGreaterThan(0);
  });
});
