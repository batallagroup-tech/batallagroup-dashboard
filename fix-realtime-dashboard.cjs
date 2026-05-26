const fs = require("fs");
let f = fs.readFileSync("src/App.tsx", "utf8");

// 1. Agregar componente RealtimeIndicator antes del export default
const indicator = `
function RealtimeIndicator({ theme }: { theme: Theme }) {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => setGlow(v => !v), 1200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 116, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 6,
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: 20, padding: "5px 12px", backdropFilter: "blur(8px)",
      cursor: "default", userSelect: "none",
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
        boxShadow: glow ? "0 0 10px 3px rgba(34,197,94,0.6)" : "0 0 4px rgba(34,197,94,0.3)",
        transition: "box-shadow 0.6s ease",
      }} />
      <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>
        TIEMPO REAL
      </span>
    </div>
  );
}

`;

f = f.replace("export default function App()", indicator + "export default function App()");

// 2. Mostrar en todas las pantallas excepto login
f = f.replace(
  "return (\n    <>\n      {searchOpen",
  `return (
    <>
      {screen !== "login" && <RealtimeIndicator theme={theme} />}
      {searchOpen`
);

fs.writeFileSync("src/App.tsx", f);
console.log("OK dashboard");
