import { parseAndMapCode, type ImportScope } from "./hytale-parser";
import { componentsToCode } from "./tree-utils";
import type { HytaleComponent } from "./hytale-types";

/**
 * Cross-file `@` import resolution.
 *
 * A Hytale UI file pulls constants and templates from a sibling file with two
 * lines:
 *
 *   $Common = "../Common.ui";
 *   Label #Title { Style: $Common.@TitleStyle; }
 *
 * Until now the Studio kept the import line as text but resolved `$Common.@X`
 * to nothing, so every cross-file style silently became undefined. These
 * helpers parse the referenced files and hand their exports to the parser.
 */

/** One `$Alias = "path/to/File.ui";` declaration. */
export interface ParsedImport {
  alias: string;
  path: string;
  /** Trailing filename, e.g. "Common.ui" — how the Studio names its files. */
  fileName: string;
}

const IMPORT_RE = /^\s*(\$\w+)\s*=\s*"([^"]+)"\s*;?\s*$/;

/** Extracts alias/path pairs from raw import lines. */
export function parseImportLines(lines: string[]): ParsedImport[] {
  const out: ParsedImport[] = [];
  for (const line of lines) {
    const m = line.match(IMPORT_RE);
    if (!m) continue;
    const [, alias, path] = m;
    out.push({ alias, path, fileName: path.split("/").pop() ?? path });
  }
  return out;
}

/**
 * Builds the scope for a file from the sources it imports.
 *
 * `resolveSource` maps a filename ("Common.ui") to that file's source text, or
 * undefined when the project has no such file — an unresolved import is not an
 * error, it just yields no constants, exactly as before this feature existed.
 *
 * `depth` bounds transitive resolution so a cycle (A imports B, B imports A)
 * terminates instead of recursing forever.
 */
export function buildImportScope(
  importLines: string[],
  resolveSource: (fileName: string) => string | undefined,
  depth = 2,
): ImportScope {
  const scope: ImportScope = {};
  if (depth <= 0) return scope;

  for (const { alias, fileName } of parseImportLines(importLines)) {
    const source = resolveSource(fileName);
    if (source === undefined || source.trim() === "") continue;

    try {
      // Resolve the imported file against its own imports too, so a constant
      // defined as `$Other.@Base` inside Common.ui still resolves.
      const inner = parseAndMapCode(source);
      const nested = buildImportScope(inner.imports, resolveSource, depth - 1);
      const resolved = parseAndMapCode(source, nested);
      scope[alias] = { props: resolved.exports };
    } catch {
      // A malformed sibling must not break the file being edited.
      continue;
    }
  }

  return scope;
}

/** Minimal shape needed from a project file; matches UIFile. */
export interface ScopeSourceFile {
  name: string;
  components: HytaleComponent[];
  imports: string[];
}

/**
 * Convenience wrapper for the store: resolves a file's imports against the
 * other files of the same project.
 *
 * The Studio keeps parsed components rather than source text, so each sibling
 * is regenerated with componentsToCode before being parsed for its exports.
 * That covers templates, which round-trip faithfully. Plain constants
 * (`@Gap = 12;`) are not part of the component model yet, so they are still
 * invisible across files — see the note in the project README.
 */
export function buildScopeFromProjectFiles(
  importLines: string[],
  files: ScopeSourceFile[],
  currentFileName?: string,
): ImportScope {
  const sourceOf = (fileName: string): string | undefined => {
    if (fileName === currentFileName) return undefined; // never import yourself
    const file = files.find((f) => f.name === fileName);
    if (!file) return undefined;
    return componentsToCode(file.components, 0, file.imports);
  };
  return buildImportScope(importLines, sourceOf);
}
