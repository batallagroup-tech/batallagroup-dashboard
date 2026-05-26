const fs = require("fs");
let f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");

const viejo = `      await db().query(
        "INSERT INTO repartidores (id, vehiculo, placa, status, verificado, documentos, rating) VALUES ($1,$2,$3,'offline',true,$4::jsonb,5.0) ON CONFLICT (id) DO UPDATE SET vehiculo=EXCLUDED.vehiculo, placa=EXCLUDED.placa, verificado=true, documentos=EXCLUDED.documentos",
        [s.usuario_id, vehiculo, s.datos?.vehiculo_placas ?? "", docs]
      );`;

const nuevo = `      const existe = await db().query("SELECT id FROM repartidores WHERE id = $1", [s.usuario_id]);
      if (existe.length > 0) {
        await db().query("UPDATE repartidores SET vehiculo=$1, placa=$2, verificado=true, documentos=$3::jsonb WHERE id=$4",
          [vehiculo, s.datos?.vehiculo_placas ?? "", docs, s.usuario_id]);
      } else {
        await db().query("INSERT INTO repartidores (id, vehiculo, placa, status, verificado, documentos, rating) VALUES ($1,$2,$3,'offline',true,$4::jsonb,5.0)",
          [s.usuario_id, vehiculo, s.datos?.vehiculo_placas ?? "", docs]);
      }`;

if (!f.includes(viejo.substring(0, 50))) {
  console.log("TEXTO NO ENCONTRADO - revisando...");
  // Buscar donde esta la funcion aprobar del repartidor
  const idx = f.lastIndexOf("const aprobar = async");
  console.log("aprobar encontrado en indice:", idx);
  console.log("Contexto:", f.substring(idx, idx + 300));
} else {
  f = f.replace(viejo, nuevo);
  fs.writeFileSync("src/pages/YaVoy.tsx", f);
  console.log("OK - archivo actualizado");
}
