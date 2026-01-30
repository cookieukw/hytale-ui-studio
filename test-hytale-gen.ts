import { componentsToCode } from "./lib/tree-utils";
import { HytaleComponent } from "./lib/hytale-types";

// Test Case: Label with TextColor
const mockLabel: HytaleComponent = {
  id: "comp_lbl_1",
  type: "Label",
  name: "MyLabel",
  alias: "$C.@DefaultLabelStyle",
  text: "Hello World",
  textStyle: {
    fontSize: 14,
    textColor: "#ff0000",
    alignment: "Center",
  },
};

console.log("--- Label Output ---");
console.log(componentsToCode([mockLabel]));
