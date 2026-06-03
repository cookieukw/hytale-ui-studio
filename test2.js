const fs = require('fs');
const code = fs.readFileSync('src/main/resources/Common/UI/Custom/Template/RPGInventory.ui', 'utf-8');

// I will just mock the Lexer and Parser logic to see what my exact code does
// But wait, the compiled code is inside `.next` or something.
// I can just read the compiled file if it's there, but I can also just run the next.js app?
// Let's just grep the `width` property in the React DOM.
// Actually, no. I can write a script to just hit the local server!
// The local server has no API.

// Let's just extract the lexer and parser and run them!
// Actually, it's easier to just search for the bug in hytale-parser.ts.
