import { parseAndMapCode } from "./lib/hytale-parser";
const result = parseAndMapCode(`Group #InventoryWindow { Padding: 10; Margin: 5; }`);
console.log(JSON.stringify(result.components[0], null, 2));
