const fs = require("fs");
let f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");

const viejo = `await db().query("INSERT INTO viveres (owner_id, nombre, tipo, direccion, imagen_url, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (owner_id) DO UPDATE SET nombre=EXCLUDED.nombre, status='aprobado'",
        [s.usuario_id, s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", "aprobado"]);`;

const nuevo = `const existeViveres = await db().query("SELECT id FROM viveres WHERE owner_id = $1", [s.usuario_id]);
      if (existeViveres.length > 0) {
        await db().query("UPDATE viveres SET nombre=$1, tipo=$2, direccion=$3, imagen_url=$4, status='aprobado' WHERE owner_id=$5",
          [s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", s.usuario_id]);
      } else {
        await db().query("INSERT INTO viveres (owner_id, nombre, tipo, direccion, imagen_url, status) VALUES ($1,$2,$3,$4,$5,$6)",
          [s.usuario_id, s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", "aprobado"]);
      }`;

f = f.replace(viejo, nuevo);
fs.writeFileSync("src/pages/YaVoy.tsx", f);
console.log(f.includes("existeViveres") ? "OK" : "NO ENCONTRADO");
