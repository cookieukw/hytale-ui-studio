import { parseAndMapCode } from "./lib/hytale-parser";
import * as fs from "fs";

const code = fs.readFileSync("../hy mods/hytale-interfaces/src/main/resources/Common/UI/Custom/Template/RPGInventory.ui", "utf-8");
const result = parseAndMapCode(code);

const leftPanel = result.components[0].children[0].children[0];
console.log("LeftPanel name:", leftPanel.name);
console.log("LeftPanel padding:", leftPanel.padding);

