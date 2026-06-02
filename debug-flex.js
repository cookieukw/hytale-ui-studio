const fs = require("fs");
const file = fs.readFileSync("components/editor/rendered-component.tsx", "utf8");
console.log(file.includes("flexGrow = component.flexWeight"));
