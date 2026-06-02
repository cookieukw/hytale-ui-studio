import { parseAndMapCode } from "./lib/hytale-parser";
import fs from "fs";

const code = fs.readFileSync("/home/cookie/Documents/hy mods/hytale-interfaces/src/main/resources/Common/UI/Custom/Template/CenterMiddle.ui", "utf-8");
const result = parseAndMapCode(code);
console.log(JSON.stringify(result, null, 2));
