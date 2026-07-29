import { describe, it, expect } from "vitest";
import { parseAndMapCode } from "../lib/hytale-parser";
import { buildImportScope, parseImportLines } from "../lib/import-scope";

const COMMON = `
@TitleStyle = LabelStyle(FontSize: 20, TextColor: #b4c8c9, RenderBold: true);
@Gap = 12;

@Divider = Group {
  Anchor: (Height: 2);
};
`;

const PAGE = `$Common = "../Common.ui";

Label #Title {
  Style: $Common.@TitleStyle;
}
`;

const sources: Record<string, string> = { "Common.ui": COMMON };
const resolve = (name: string) => sources[name];

describe("parseImportLines", () => {
  it("reads alias, path and filename", () => {
    expect(parseImportLines([`$Common = "../Common.ui";`])).toEqual([
      { alias: "$Common", path: "../Common.ui", fileName: "Common.ui" },
    ]);
  });

  it("ignores lines that are not imports", () => {
    expect(parseImportLines(["@Gap = 12;", ""])).toEqual([]);
  });
});

describe("buildImportScope", () => {
  it("exposes constants and templates of the imported file", () => {
    const scope = buildImportScope([`$Common = "../Common.ui";`], resolve);
    expect(Object.keys(scope)).toEqual(["$Common"]);
    expect(Object.keys(scope.$Common.props).sort()).toEqual([
      "@Divider",
      "@Gap",
      "@TitleStyle",
    ]);
  });

  it("skips imports the project cannot resolve", () => {
    const scope = buildImportScope([`$Missing = "../Nope.ui";`], resolve);
    expect(scope).toEqual({});
  });

  it("terminates on import cycles", () => {
    const cyclic: Record<string, string> = {
      "A.ui": `$B = "./B.ui";\n@FromA = 1;\n`,
      "B.ui": `$A = "./A.ui";\n@FromB = 2;\n`,
    };
    const scope = buildImportScope([`$A = "./A.ui";`], (n) => cyclic[n]);
    expect(scope.$A.props["@FromA"]).toBeDefined();
  });
});

describe("cross-file resolution end to end", () => {
  it("resolves $Common.@TitleStyle into a real style", () => {
    // Without a scope the reference is lost — this is the old behaviour.
    const before = parseAndMapCode(PAGE);
    expect(before.components[0].textStyle).toBeUndefined();

    const scope = buildImportScope(before.imports, resolve);
    const after = parseAndMapCode(PAGE, scope);

    // The strongest assertion available: importing the style across files must
    // produce exactly what writing it inline produces.
    const inline = parseAndMapCode(
      `Label #Title {\n  Style: LabelStyle(FontSize: 20, TextColor: #b4c8c9, RenderBold: true);\n}\n`,
    );
    expect(after.components[0].textStyle).toEqual(inline.components[0].textStyle);
    expect(after.components[0].textStyle?.fontSize).toBe(20);
  });
});
