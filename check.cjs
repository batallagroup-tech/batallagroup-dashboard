const fs = require("fs");
const f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");
const idx = f.indexOf("INSERT INTO viveres");
console.log(f.substring(idx - 20, idx + 300));
