import { describe, it } from "vitest";
import { parseAndMapCode } from "./lib/hytale-parser";
import { buildImportScope } from "./lib/import-scope";
const COMMON = `@TitleStyle = LabelStyle(FontSize: 20, TextColor: #b4c8c9, RenderBold: true);\n`;
const PAGE = `$Common = "../Common.ui";\n\nLabel #Title {\n  Style: $Common.@TitleStyle;\n}\n`;
describe("dbg", () => {
  it("x", () => {
    const ex = parseAndMapCode(COMMON).exports;
    console.log("EXPORTS:", JSON.stringify(ex));
    const scope = buildImportScope([`$Common = "../Common.ui";`], n => n === "Common.ui" ? COMMON : undefined);
    console.log("SCOPE  :", JSON.stringify(scope));
    const after = parseAndMapCode(PAGE, scope);
    console.log("COMP   :", JSON.stringify(after.components[0]));
  });
});
