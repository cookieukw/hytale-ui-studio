import { describe, it, expect } from "vitest";
import { parseAndMapCode } from "../lib/hytale-parser";
import { componentsToCode } from "../lib/tree-utils";

const rt = (src: string) => {
  const r = parseAndMapCode(src);
  const out = componentsToCode(r.components).split("\n")[1].trim();
  console.log(`  in : ${src.split("\n")[1].trim()}\n  out: ${out}`);
  return out;
};

describe("background round-trip", () => {
  it("full PatchStyle survives export", () => {
    expect(rt(`Group #A {\n  Background: PatchStyle(TexturePath: "Panel.png", Border: 46, Color: #ffffff(0.5));\n}\n`))
      .toBe(`Background: PatchStyle(TexturePath: "Panel.png", Border: 46, Color: #ffffff(0.5));`);
  });
  it("bare texture path survives export", () => {
    expect(rt(`Group #B {\n  Background: "HotbarBackground.png";\n}\n`))
      .toBe(`Background: "HotbarBackground.png";`);
  });
  it("HorizontalBorder survives export", () => {
    expect(rt(`Group #C {\n  Background: (TexturePath: "Bar.png", HorizontalBorder: 74);\n}\n`))
      .toBe(`Background: (TexturePath: "Bar.png", HorizontalBorder: 74);`);
  });
  it("plain colour is unchanged", () => {
    expect(rt(`Group #D {\n  Background: #000000(0.55);\n}\n`))
      .toBe(`Background: #000000(0.55);`);
  });
});
