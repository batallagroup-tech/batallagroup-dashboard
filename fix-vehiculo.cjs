const fs = require("fs");
let f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");

// Cambiar la linea que construye vehiculo
f = f.replace(
  'const vehiculo = ((s.datos?.vehiculo_tipo || "") + " " + (s.datos?.vehiculo_modelo || "")).trim();',
  'const vehiculo = s.datos?.vehiculo_tipo || "moto"; // solo tipo: moto/auto/bici'
);

// Tambien el que usa template literal (version anterior)
f = f.replace(
  'const vehiculo = `${s.datos?.vehiculo_tipo || ""} ${s.datos?.vehiculo_modelo || ""}`.trim();',
  'const vehiculo = s.datos?.vehiculo_tipo || "moto";'
);

// Incluir modelo en documentos
f = f.replace(
  'const docs = JSON.stringify({ ...s.documentos, nombre_ine: nombre, telefono: s.datos?.telefono });',
  'const docs = JSON.stringify({ ...s.documentos, nombre_ine: nombre, telefono: s.datos?.telefono, vehiculo_modelo: s.datos?.vehiculo_modelo });'
);

fs.writeFileSync("src/pages/YaVoy.tsx", f);
console.log("OK");
