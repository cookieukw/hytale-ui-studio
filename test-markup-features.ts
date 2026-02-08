import { parseAndMapCode } from "./lib/hytale-parser";

const testCode = `
@Row = Group {
    Content {
        Label { Text: @RowText; }
    }
};

Group {
    // Local scope variable test
    @RowText = "Hello Row 1";
    
    // Array syntax test
    TextSpans: [(Text: "Hi", IsBold: true)];
    
    // Translation syntax test
    Text: %ui.general.test;
    
    // Color syntax test
    Background: #112233(0.5);
    Border: #AABBCCDD;
    
    // Template instantiation test
    @Row #MyRow1 {
        // Nested variable override test
        @RowText = "Override Row 1";
    }
}
`;

try {
  console.log("Starting Markup Verification...");
  const result = parseAndMapCode(testCode);
  const root = result.components[0];

  console.log("Root Children Count:", root.children?.length);

  // Check Template Instantiation
  const row1 = root.children?.find((c) => c.name === "MyRow1");
  if (!row1) {
    console.error(
      "FAIL: Template instantiation '@Row #MyRow1' failed - component not found.",
    );
  } else {
    console.log("PASS: Template instantiation found.");
    // Check if content was copied from template
    if (row1.children && row1.children.length > 0) {
      console.log("PASS: Template content copied.");
    } else {
      console.error("FAIL: Template content missing.");
    }
  }

  // Check Array Syntax
  // The parser puts unexpected props into 'props' object if not mapped in mapNodeToComponent
  // We need to inspect strict mapping or raw node props to be sure if mapping filters them out
  // But mapNodeToComponent iterates Object.entries(props), so it should try to handle it.
  // If it's unknown, it does nothing? No, mapNodeToComponent only handles specific keys.
  // However, the parser itself must not throw error on syntax.

  // Check Translation
  if (root.text === "%ui.general.test") {
    console.log("PASS: Translation syntax parsed as string.");
  } else {
    console.error(
      "FAIL: Translation syntax not parsed correctly. Got:",
      root.text,
    );
  }

  console.log("Verification checks completed.");
} catch (e) {
  console.error("Test Failed with Exception:", e);
}
