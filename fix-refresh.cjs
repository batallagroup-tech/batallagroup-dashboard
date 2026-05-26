const fs = require("fs");
let f = fs.readFileSync("src/pages/YaVoy.tsx", "utf8");

// Auto-refresh en RestauranteAdmin y RepartidorAdmin
// Reemplazar el useEffect simple por uno con intervalo
f = f.replaceAll(
  "useEffect(() => { cargar(); }, []);",
  `useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 10000); // refresca cada 10s
    return () => clearInterval(iv);
  }, []);`
);

fs.writeFileSync("src/pages/YaVoy.tsx", f);
console.log("Auto-refresh OK - " + (f.match(/setInterval/g)?.length || 0) + " intervalos agregados");
