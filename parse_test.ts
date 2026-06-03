import * as fs from 'fs';
import { parseAndMapCode } from './lib/hytale-parser';

const code = fs.readFileSync('src/main/resources/Common/UI/Custom/Template/RPGInventory.ui', 'utf-8');
const result = parseAndMapCode(code);
console.log(JSON.stringify(result.components[0].children[0].children[0].children[1].children[0].children[0], null, 2));
