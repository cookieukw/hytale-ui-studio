import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { parseAndMapCode } from "../lib/hytale-parser";

/**
 * Parity suite against the real .ui files shipped with the Hytale client.
 *
 * No Hypixel-owned file is committed to this repository. The corpus is read
 * from a path given by the HYTALE_UI_CORPUS environment variable. Without it
 * these tests are skipped, so the build stays green for anyone who does not
 * have the game installed.
 *
 *   HYTALE_UI_CORPUS=/path/to/Client/Data/Game/Interface pnpm test
 *
 * Why this exists: the corpus is a free oracle. If the parser fails on a file
 * written by the game's own developers, the parser is what is wrong.
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

suite("parity with the real Hytale corpus", () => {
  const files = available ? walk(CORPUS!) : [];

  it("finds .ui files in the corpus", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("parses every .ui file without throwing", () => {
    const failures: string[] = [];
    for (const f of files) {
      try {
        parseAndMapCode(readFileSync(f, "utf8"));
      } catch (e) {
        failures.push(`${f.replace(CORPUS!, "")}: ${(e as Error).message}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("never yields an empty result when the source has element blocks", () => {
    // A file containing `Node { ... }` must produce components or templates.
    // Zero for both means the parser understood nothing — exactly what happened
    // with template libraries before `@Name = Node { ... };` was supported.
    const empty: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const blocks = (
        src.replace(/\/\/.*$/gm, "").match(/^\s*[A-Z]\w*\s*(#\w+)?\s*\{/gm) || []
      ).length;
      if (blocks === 0) continue;

      const { components, templates } = parseAndMapCode(src);
      if (components.length === 0 && templates.length === 0) {
        empty.push(`${f.replace(CORPUS!, "")} (${blocks} blocks)`);
      }
    }
    expect(empty).toEqual([]);
  });

  it("materialises template libraries", () => {
    // Files that only declare `@Name = Node { ... };` must expose templates.
    const withTemplates = files.filter(
      (f) => parseAndMapCode(readFileSync(f, "utf8")).templates.length > 0,
    );
    expect(withTemplates.length).toBeGreaterThan(0);
  });
});
