import { describe, it, expect } from "vitest";
import { formatTextValue, componentsToCode } from "../lib/tree-utils";
import { parseAndMapCode } from "../lib/hytale-parser";
import type { HytaleComponent } from "../lib/hytale-types";

describe("formatTextValue", () => {
  it("quotes plain literals", () => {
    expect(formatTextValue("Play")).toBe('"Play"');
    expect(formatTextValue("")).toBe('""');
  });

  it("leaves template parameters unquoted", () => {
    // Regression: quoting this made buttons render the literal string "@Text".
    expect(formatTextValue("@Text")).toBe("@Text");
  });

  it("leaves translation keys unquoted", () => {
    expect(formatTextValue("%client.mainMenu.navigation.worlds")).toBe(
      "%client.mainMenu.navigation.worlds",
    );
  });

  it("leaves concatenations unquoted", () => {
    expect(formatTextValue('%client.menu.play + " "')).toBe(
      '%client.menu.play + " "',
    );
  });
});

describe("template round-trip", () => {
  const source = [
    "@Subtitle = Label {",
    "  Text: @Text;",
    "};",
    "",
    "Label #Plain {",
    '  Text: "Hello";',
    "}",
    "",
  ].join("\n");

  it("keeps template definitions through export and re-import", () => {
    const first = parseAndMapCode(source);
    expect(first.templates).toHaveLength(1);
    expect(first.templates[0].name).toBe("@Subtitle");

    const merged: HytaleComponent[] = [...first.templates, ...first.components];
    const exported = componentsToCode(merged, 0, first.imports);

    // Template syntax, not `Label #@Subtitle {`.
    expect(exported).toContain("@Subtitle = Label {");
    expect(exported).toContain("};");
    // Parameter stays an expression; the plain literal stays quoted.
    expect(exported).toContain("Text: @Text;");
    expect(exported).toContain('Text: "Hello";');

    const second = parseAndMapCode(exported);
    expect(second.templates).toHaveLength(first.templates.length);
    expect(second.templates[0].name).toBe("@Subtitle");
  });
});
