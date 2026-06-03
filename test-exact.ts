import { parseAndMapCode } from "./lib/hytale-parser";
const code = `
Group #InventoryWindow {
  Group #LeftPanel {
    FlexWeight: 1;
    LayoutMode: Top;
    Background: #D2AD8E;
    Anchor: (Right: 10);
    Padding: 10;
    
    Group #LeftTabs {
      LayoutMode: Left;
      Anchor: (Height: 40, Bottom: 10);
    }
  }
}
`;
const result = parseAndMapCode(code);
console.log(JSON.stringify(result.components[0].children[0], null, 2));
