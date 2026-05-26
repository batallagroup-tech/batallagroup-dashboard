const fs = require("fs");
let f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");

// Quitar botones de Actualizar en ambos admins
f = f.replaceAll(
  '<button onClick={cargar} style={{ marginLeft: "auto", ...btn("#3b82f6") }}>↻ Actualizar</button>',
  `<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>TIEMPO REAL</span>
        </div>`
);

fs.writeFileSync("src/pages/YaVoy.tsx", f);
console.log("OK YaVoy");
