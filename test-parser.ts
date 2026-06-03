import * as fs from 'fs';
import { parseAndMapCode } from './lib/hytale-parser';

const code = fs.readFileSync('/home/cookie/Documents/hy mods/hytale-interfaces/src/main/resources/Common/UI/Custom/Template/RPGInventory.ui', 'utf-8');
const result = parseAndMapCode(code);
console.dir(result.components[0]?.children?.[0]?.children?.[1]?.children?.[1]?.children?.[0], { depth: null });
