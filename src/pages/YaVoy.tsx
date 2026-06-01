import { useState, useEffect } from "react";
import type { Theme } from "../App";
import { neon } from "@neondatabase/serverless";

interface Props { onBack: () => void; theme: Theme }
type SubApp = "restaurante" | "repartidor" | "cliente" | "config" | "soporte" | "bloqueos" | "retiros" | "fondo" | "contingencias" | null;

interface Solicitud {
  id: string;
  usuario_id: string;
  tipo: string;
  status: "pendiente" | "aprobado" | "rechazado";
  datos: Record<string, any>;
  documentos: Record<string, any>;
  razon_rechazo?: string;
  creado_en: string;
  usuario_email?: string;
}

const SUBAPPS = [
  { id: "restaurante", name: "Ya Voy Restaurante", icon: "🍽️", desc: "Solicitudes y panel de restaurantes" },
  { id: "repartidor",  name: "Ya Voy Repartidor",  icon: "🛵", desc: "Solicitudes de repartidores" },
  { id: "cliente",     name: "Ya Voy Cliente",      icon: "📱", desc: "App para pedir comida a domicilio" },
  { id: "config",      name: "Configuracion",        icon: "⚙️",  desc: "Email, WhatsApp y URLs del sistema" },
  { id: "soporte",     name: "Soporte",               icon: "🎧",  desc: "Reportes de usuarios — ayuda y problemas" },
  { id: "bloqueos",    name: "Cuentas Bloqueadas",    icon: "🔒",  desc: "Bloqueo y desbloqueo de usuarios, repartidores y restaurantes" },
  { id: "retiros",     name: "Retiros",                icon: "💸",  desc: "Solicitudes de retiro de ganancias — restaurantes y repartidores" },
  { id: "fondo",       name: "Fondo de Recuperación",  icon: "🛡️",  desc: "15% de comisiones reservado para emergencias y contingencias" },
  { id: "contingencias", name: "Contingencias",           icon: "🚨",  desc: "No pagos, accidentes y cancelaciones automaticas" },
];

const STATUS_COLOR: Record<string, string> = { pendiente: "#f59e0b", aprobado: "#22c55e", rechazado: "#ef4444" };
const STATUS_LABEL: Record<string, string> = { pendiente: "Pendiente", aprobado: "Aprobado", rechazado: "Rechazado" };

const RAZONES_REST = [
  "INE ilegible o de baja calidad","INE no coincide con el selfie",
  "Selfie no muestra el rostro claramente","Dirección no verificable",
  "Información incompleta o incorrecta","Negocio ya registrado con otro correo","RFC no corresponde al titular",
];

const RAZONES_REP = [
  "INE ilegible o de baja calidad","INE no coincide con el selfie",
  "Selfie no muestra el rostro claramente","Tarjeta de circulación ilegible",
  "Placas no coinciden con la tarjeta","Información del vehículo incorrecta","Nombre no coincide con el INE",
];

const db = () => neon(import.meta.env.VITE_DATABASE_URL!);

// ─── RESTAURANTE ────────────────────────────────────────────────────────────
function RestauranteAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [tab, setTab]           = useState<"pendientes"|"aprobados"|"rechazados">("pendientes");
  const [solicitudes, setSol]   = useState<Solicitud[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [razon, setRazon]       = useState("");
  const [rechazando, setRech]   = useState<string | null>(null);
  const [procesando, setProc]   = useState<string | null>(null);
  const [expandido, setExp]     = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await db().query("SELECT s.*, u.email as usuario_email FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id WHERE s.tipo = $1 ORDER BY s.creado_en DESC", ["negocio"]);
      setSol(data as Solicitud[]);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 10000); // refresca cada 10s
    return () => clearInterval(iv);
  }, []);

  const aprobar = async (s: Solicitud) => {
    setProc(s.id);
    try {
      const existeViveres = await db().query("SELECT id FROM viveres WHERE owner_id = $1", [s.usuario_id]);
      if (existeViveres.length > 0) {
        await db().query("UPDATE viveres SET nombre=$1, tipo=$2, direccion=$3, imagen_url=$4, status='aprobado', lat=$6, lng=$7 WHERE owner_id=$5",
          [s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", s.usuario_id, s.datos?.lat ?? null, s.datos?.lng ?? null]);
      } else {
        await db().query("INSERT INTO viveres (owner_id, nombre, tipo, direccion, imagen_url, status, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [s.usuario_id, s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", "aprobado", s.datos?.lat ?? null, s.datos?.lng ?? null]);
      }
      await db().query("UPDATE solicitudes SET status=$1 WHERE id=$2", ["aprobado", s.id]);
      await cargar();
    } catch (e: any) { setError("Error al aprobar: " + e.message); }
    finally { setProc(null); }
  };

  const rechazar = async (id: string) => {
    if (!razon.trim()) return;
    setProc(id);
    try {
      await db().query("UPDATE solicitudes SET status=$1, razon_rechazo=$2 WHERE id=$3", ["rechazado", razon, id]);
      setRech(null); setRazon(""); await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const filtradas = solicitudes.filter(s => tab === "pendientes" ? s.status === "pendiente" : tab === "aprobados" ? s.status === "aprobado" : s.status === "rechazado");
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 };
  const tag  = (c: string) => ({ background: `${c}20`, border: `1px solid ${c}40`, borderRadius: 6, color: c, padding: "2px 10px", fontSize: 10, fontWeight: 700 as const, display: "inline-block" });
  const btn  = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 as const });

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🍽️ Ya Voy Restaurante</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>SOLICITUDES · NEON</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>TIEMPO REAL</span>
        </div>
      </div>
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
          {(["pendientes","aprobados","rechazados"] as const).map(t => {
            const count = solicitudes.filter(s => t === "pendientes" ? s.status === "pendiente" : t === "aprobados" ? s.status === "aprobado" : s.status === "rechazado").length;
            const color = t === "pendientes" ? "#f59e0b" : t === "aprobados" ? "#22c55e" : "#ef4444";
            return (
              <div key={t} onClick={() => setTab(t)} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0, cursor: "pointer", opacity: tab === t ? 1 : 0.5 }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.2em", margin: "0 0 6px" }}>{t.toUpperCase()}</p>
                <p style={{ color, fontSize: 28, fontWeight: 900, margin: 0 }}>{count}</p>
              </div>
            );
          })}
        </div>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}
        {loading ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}>Cargando...</div>
        : filtradas.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}><p style={{ fontSize: 32, margin: "0 0 12px" }}>📭</p><p>No hay solicitudes {tab}</p></div>
        : filtradas.map(s => (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" as const, cursor: "pointer" }} onClick={() => setExp(expandido === s.id ? null : s.id)}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: "#f9731620", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🍽️</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" as const }}>
                  <span style={{ color: theme.text, fontSize: 16, fontWeight: 900 }}>{s.datos?.nombre_negocio || "Sin nombre"}</span>
                  <span style={tag(STATUS_COLOR[s.status])}>{STATUS_LABEL[s.status]}</span>
                  {s.datos?.tipo_negocio && <span style={tag("#8b5cf6")}>{s.datos.tipo_negocio}</span>}
                  <span style={{ color: theme.textDim, fontSize: 11, marginLeft: "auto" }}>{expandido === s.id ? "▲ Ocultar" : "▼ Ver docs"}</span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>📞 {s.datos?.telefono || "—"} · 📍 {s.datos?.direccion || "—"}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: "4px 0 0" }}>{new Date(s.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {s.razon_rechazo && <p style={{ color: "#ef4444", fontSize: 12, margin: "6px 0 0", background: "#ef444415", padding: "6px 10px", borderRadius: 8 }}>Razón: {s.razon_rechazo}</p>}
              </div>
              {s.status === "pendiente" && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => aprobar(s)} disabled={procesando === s.id} style={{ ...btn("#22c55e"), opacity: procesando === s.id ? 0.5 : 1 }}>{procesando === s.id ? "..." : "✔ Aprobar"}</button>
                  <button onClick={() => setRech(s.id)} disabled={procesando === s.id} style={{ ...btn("#ef4444"), opacity: procesando === s.id ? 0.5 : 1 }}>✕ Rechazar</button>
                </div>
              )}
            </div>
            {expandido === s.id && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
                <p style={{ color: theme.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 12px" }}>DOCUMENTOS</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[["INE Frente", s.documentos?.ine_frente], ["INE Reverso", s.documentos?.ine_reverso], ["Selfie", s.documentos?.selfie]].map(([label, url]) => (
                    <div key={label as string}>
                      <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, margin: "0 0 6px" }}>{(label as string).toUpperCase()}</p>
                      {url ? <a href={url as string} target="_blank" rel="noreferrer"><img src={url as string} alt={label as string} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, border: `1px solid ${theme.border}` }} /></a>
                      : <div style={{ width: "100%", height: 120, borderRadius: 10, background: theme.bg, border: `1px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textDim, fontSize: 12 }}>Sin documento</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {rechazando === s.id && (
              <div style={{ marginTop: 14, padding: 14, background: "#ef444410", border: "1px solid #ef444430", borderRadius: 10 }}>
                <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>Motivo del rechazo:</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 }}>
                  {RAZONES_REST.map(r => <button key={r} onClick={() => setRazon(r)} style={{ background: razon === r ? "#ef444430" : theme.surface, border: `1px solid ${razon === r ? "#ef4444" : theme.border}`, borderRadius: 20, color: razon === r ? "#ef4444" : theme.textMuted, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{r}</button>)}
                </div>
                <textarea value={razon} onChange={e => setRazon(e.target.value)} placeholder="O escribe un motivo..." style={{ width: "100%", minHeight: 70, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => rechazar(s.id)} disabled={!razon.trim()} style={{ ...btn("#ef4444"), opacity: !razon.trim() ? 0.4 : 1 }}>Confirmar rechazo</button>
                  <button onClick={() => { setRech(null); setRazon(""); }} style={btn(theme.textMuted)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REPARTIDOR ──────────────────────────────────────────────────────────────
function RepartidorAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [tab, setTab]         = useState<"pendientes"|"aprobados"|"rechazados">("pendientes");
  const [solicitudes, setSol] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [razon, setRazon]     = useState("");
  const [rechazando, setRech] = useState<string | null>(null);
  const [procesando, setProc] = useState<string | null>(null);
  const [expandido, setExp]   = useState<string | null>(null);
  // Nombre editable por admin antes de aprobar
  const [nombreEdit, setNombreEdit] = useState<Record<string, string>>({});

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await db().query("SELECT s.*, u.email as usuario_email FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id WHERE s.tipo = $1 ORDER BY s.creado_en DESC", ["repartidor"]);
      setSol(data as Solicitud[]);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 10000); // refresca cada 10s
    return () => clearInterval(iv);
  }, []);

  const getNombre = (s: Solicitud) => nombreEdit[s.id] ?? s.datos?.nombre ?? "";

  const aprobar = async (s: Solicitud) => {
    setProc(s.id);
    const nombre = getNombre(s);
    try {
      const vehiculo = s.datos?.vehiculo_tipo || "moto";
      const docs = JSON.stringify({ ...s.documentos, nombre_ine: nombre, telefono: s.datos?.telefono, vehiculo_modelo: s.datos?.vehiculo_modelo });
      // Crear/actualizar en repartidores
      const existe = await db().query("SELECT id FROM repartidores WHERE id = $1", [s.usuario_id]);
      if (existe.length > 0) {
        await db().query("UPDATE repartidores SET vehiculo=$1, placa=$2, verificado=true, documentos=$3::jsonb WHERE id=$4",
          [vehiculo, s.datos?.vehiculo_placas ?? "", docs, s.usuario_id]);
      } else {
        await db().query("INSERT INTO repartidores (id, vehiculo, placa, status, verificado, documentos, rating) VALUES ($1,$2,$3,'offline',true,$4::jsonb,5.0)",
          [s.usuario_id, vehiculo, s.datos?.vehiculo_placas ?? "", docs]);
      }
      // Actualizar nombre en usuarios con el nombre del INE
      await db().query("UPDATE usuarios SET nombre=$1 WHERE id=$2", [nombre, s.usuario_id]);
      // Marcar solicitud como aprobada
      await db().query("UPDATE solicitudes SET status=$1 WHERE id=$2", ["aprobado", s.id]);
      await cargar();
    } catch (e: any) { setError("Error al aprobar: " + e.message); }
    finally { setProc(null); }
  };

  const rechazar = async (id: string) => {
    if (!razon.trim()) return;
    setProc(id);
    try {
      await db().query("UPDATE solicitudes SET status=$1, razon_rechazo=$2 WHERE id=$3", ["rechazado", razon, id]);
      setRech(null); setRazon(""); await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const filtradas = solicitudes.filter(s => tab === "pendientes" ? s.status === "pendiente" : tab === "aprobados" ? s.status === "aprobado" : s.status === "rechazado");
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 };
  const tag  = (c: string) => ({ background: `${c}20`, border: `1px solid ${c}40`, borderRadius: 6, color: c, padding: "2px 10px", fontSize: 10, fontWeight: 700 as const, display: "inline-block" });
  const btn  = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 as const });

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🛵 Ya Voy Repartidor</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>SOLICITUDES · NEON</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>TIEMPO REAL</span>
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {/* Tabs con contadores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
          {(["pendientes","aprobados","rechazados"] as const).map(t => {
            const count = solicitudes.filter(s => t === "pendientes" ? s.status === "pendiente" : t === "aprobados" ? s.status === "aprobado" : s.status === "rechazado").length;
            const color = t === "pendientes" ? "#f59e0b" : t === "aprobados" ? "#22c55e" : "#ef4444";
            return (
              <div key={t} onClick={() => setTab(t)} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0, cursor: "pointer", opacity: tab === t ? 1 : 0.5 }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.2em", margin: "0 0 6px" }}>{t.toUpperCase()}</p>
                <p style={{ color, fontSize: 28, fontWeight: 900, margin: 0 }}>{count}</p>
              </div>
            );
          })}
        </div>

        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}

        {loading ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}>Cargando solicitudes...</div>
        : filtradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>📭</p>
            <p>No hay solicitudes {tab}</p>
          </div>
        ) : filtradas.map(s => (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" as const, cursor: "pointer" }} onClick={() => setExp(expandido === s.id ? null : s.id)}>
              {/* Avatar selfie */}
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: theme.bg, border: `1px solid ${theme.border}` }}>
                {s.documentos?.selfie
                  ? <img src={s.documentos.selfie} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🛵</div>}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" as const }}>
                  <span style={{ color: theme.text, fontSize: 16, fontWeight: 900 }}>{s.datos?.nombre || "Sin nombre"}</span>
                  <span style={tag(STATUS_COLOR[s.status])}>{STATUS_LABEL[s.status]}</span>
                  {s.datos?.vehiculo_tipo && <span style={tag("#8b5cf6")}>{s.datos.vehiculo_tipo}</span>}
                  <span style={{ color: theme.textDim, fontSize: 11, marginLeft: "auto" }}>{expandido === s.id ? "▲ Ocultar" : "▼ Ver docs"}</span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>📞 {s.datos?.telefono || "—"}</p>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>🏍️ {s.datos?.vehiculo_modelo || "—"} · 🔖 {s.datos?.vehiculo_placas || "—"}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: "4px 0 0" }}>{new Date(s.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {s.razon_rechazo && <p style={{ color: "#ef4444", fontSize: 12, margin: "6px 0 0", background: "#ef444415", padding: "6px 10px", borderRadius: 8 }}>Razón: {s.razon_rechazo}</p>}
              </div>
              {s.status === "pendiente" && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => aprobar(s)} disabled={procesando === s.id} style={{ ...btn("#22c55e"), opacity: procesando === s.id ? 0.5 : 1 }}>{procesando === s.id ? "..." : "✔ Aprobar"}</button>
                  <button onClick={() => setRech(s.id)} disabled={procesando === s.id} style={{ ...btn("#ef4444"), opacity: procesando === s.id ? 0.5 : 1 }}>✕ Rechazar</button>
                </div>
              )}
            </div>

            {/* EXPANDIDO — documentos + nombre editable */}
            {expandido === s.id && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
                {/* Nombre editable (corregir OCR si es necesario) */}
                <div style={{ marginBottom: 16, background: "#f59e0b10", border: "1px solid #f59e0b30", borderRadius: 10, padding: "12px 16px" }}>
                  <p style={{ color: "#b45309", fontSize: 11, fontWeight: 700, margin: "0 0 8px", letterSpacing: "0.1em" }}>
                    ✏️ NOMBRE DEL INE — verifica y corrige si el OCR falló
                  </p>
                  <input
                    value={getNombre(s)}
                    onChange={e => setNombreEdit(prev => ({ ...prev, [s.id]: e.target.value.toUpperCase() }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 15, fontWeight: 900, letterSpacing: "0.05em", outline: "none", boxSizing: "border-box" as const }}
                  />
                  <p style={{ color: theme.textDim, fontSize: 11, margin: "6px 0 0" }}>
                    Este nombre quedará bloqueado y se usará en todos sus pedidos.
                  </p>
                </div>

                {/* Documentos */}
                <p style={{ color: theme.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 12px" }}>DOCUMENTOS</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 12 }}>
                  {[
                    ["INE Frente", s.documentos?.ine_frente],
                    ["INE Reverso", s.documentos?.ine_reverso],
                    ["Selfie", s.documentos?.selfie],
                    ["Tarjeta Circulación", s.documentos?.tarjeta_url],
                  ].map(([label, url]) => (
                    <div key={label as string}>
                      <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, margin: "0 0 6px" }}>{(label as string).toUpperCase()}</p>
                      {url
                        ? <a href={url as string} target="_blank" rel="noreferrer"><img src={url as string} alt={label as string} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, border: `1px solid ${theme.border}`, cursor: "pointer" }} /></a>
                        : <div style={{ width: "100%", height: 140, borderRadius: 10, background: theme.bg, border: `1px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textDim, fontSize: 12 }}>Sin documento</div>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECHAZO */}
            {rechazando === s.id && (
              <div style={{ marginTop: 14, padding: 14, background: "#ef444410", border: "1px solid #ef444430", borderRadius: 10 }}>
                <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>Motivo del rechazo:</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 }}>
                  {RAZONES_REP.map(r => <button key={r} onClick={() => setRazon(r)} style={{ background: razon === r ? "#ef444430" : theme.surface, border: `1px solid ${razon === r ? "#ef4444" : theme.border}`, borderRadius: 20, color: razon === r ? "#ef4444" : theme.textMuted, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{r}</button>)}
                </div>
                <textarea value={razon} onChange={e => setRazon(e.target.value)} placeholder="O escribe un motivo personalizado..."
                  style={{ width: "100%", minHeight: 70, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => rechazar(s.id)} disabled={!razon.trim()} style={{ ...btn("#ef4444"), opacity: !razon.trim() ? 0.4 : 1 }}>Confirmar rechazo</button>
                  <button onClick={() => { setRech(null); setRazon(""); }} style={btn(theme.textMuted)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



// ─── CLIENTE ─────────────────────────────────────────────────────────────────
function ClienteAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [tab, setTab] = useState<"metricas"|"pedidos"|"usuarios">("metricas")
  const [stats, setStats] = useState({ pedidosHoy: 0, totalUsuarios: 0, restaurantesActivos: 0, repartidoresActivos: 0, ingresoHoy: 0 })
  const [pedidos, setPedidos] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [eliminando, setEliminando] = useState<string|null>(null)
  const [repartidoresOnline, setRepsOnline] = useState<any[]>([])
  const [filtroStatus, setFiltroStatus] = useState("todos")

  const cargar = async () => {
    setLoading(true); setError("")
    try {
      const repsOnlineRes = await fetch("https://ya-voy-api.onrender.com/api/repartidor/online").then(r=>r.json()).catch(()=>[])
      setRepsOnline(Array.isArray(repsOnlineRes) ? repsOnlineRes : [])
      const [statsRes, pedidosRes, usuariosRes] = await Promise.all([
        db().query(`SELECT
          (SELECT COUNT(*) FROM pedidos WHERE creado_en::date = CURRENT_DATE) as pedidos_hoy,
          (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') as total_usuarios,
          (SELECT COUNT(*) FROM viveres WHERE status = 'aprobado') as restaurantes_activos,
          (SELECT COUNT(*) FROM repartidores WHERE status = 'online') as repartidores_activos,
          (SELECT COALESCE(SUM(total),0) FROM pedidos WHERE creado_en::date = CURRENT_DATE AND status = 'entregado') as ingreso_hoy
        `),
        db().query(`SELECT p.*, u.email as cliente_email, v.nombre as negocio_nombre
          FROM pedidos p
          LEFT JOIN usuarios u ON u.id = p.cliente_id
          LEFT JOIN viveres v ON v.id = p.negocio_id
          ORDER BY p.creado_en DESC LIMIT 100`),
        db().query(`SELECT * FROM usuarios ORDER BY creado_en DESC LIMIT 200`)
      ])
      const s = statsRes[0]
      setStats({ pedidosHoy: Number(s.pedidos_hoy), totalUsuarios: Number(s.total_usuarios), restaurantesActivos: Number(s.restaurantes_activos), repartidoresActivos: Number(s.repartidores_activos), ingresoHoy: Number(s.ingreso_hoy) })
      setPedidos(pedidosRes as any[])
      setUsuarios(usuariosRes as any[])
    } catch(e: any) { setError("Error: " + e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"? Se eliminarán también sus pedidos, solicitudes y negocios. Esta acción no se puede deshacer.`)) return
    setEliminando(id)
    try {
      await db().query("DELETE FROM pedidos WHERE cliente_id = $1", [id])
      await db().query("DELETE FROM solicitudes WHERE usuario_id = $1", [id])
      await db().query("DELETE FROM viveres WHERE owner_id = $1", [id])
      await db().query("DELETE FROM repartidores WHERE id = $1", [id])
      await db().query("DELETE FROM device_tokens WHERE user_id = $1", [id])
      await db().query("DELETE FROM usuarios WHERE id = $1", [id])
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch(e: any) { setError("Error al eliminar: " + e.message) }
    finally { setEliminando(null) }
  }

  const STATUS_COLOR: Record<string, string> = { nuevo: "#f59e0b", preparando: "#3b82f6", listo: "#8b5cf6", en_camino: "#f97316", entregado: "#22c55e", cancelado: "#ef4444", esperando_cliente: "#ec4899" }
  const pedidosFiltrados = pedidos.filter(p => filtroStatus === "todos" || p.status === filtroStatus)
  const usuariosFiltrados = usuarios.filter(u => !busqueda || u.email?.toLowerCase().includes(busqueda.toLowerCase()) || u.nombre?.toLowerCase().includes(busqueda.toLowerCase()))

  const card = (label: string, value: string|number, icon: string, color: string) => (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ color, fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>{value}</p>
      <p style={{ color: theme.textDim, fontSize: 11, margin: 0, letterSpacing: "0.1em" }}>{label.toUpperCase()}</p>
    </div>
  )

  const tabBtn = (id: string, label: string) => (
    <button onClick={() => setTab(id as any)} style={{ background: tab === id ? "#3b82f6" : theme.surface, border: `1px solid ${tab === id ? "#3b82f6" : theme.border}`, borderRadius: 8, color: tab === id ? "#fff" : theme.textMuted, padding: "8px 20px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{label}</button>
  )

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>← Volver</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>📱 Ya Voy Cliente</h1>
          <p style={{ color: theme.textDim, fontSize: 11, margin: "2px 0 0", letterSpacing: "0.15em" }}>PEDIDOS · USUARIOS · MÉTRICAS</p>
        </div>
        <button onClick={cargar} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: "8px 14px", cursor: "pointer", fontSize: 12 }}>↻ Actualizar</button>
      </div>
      <div style={{ padding: "24px 28px" }}>
        {error && <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 10, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tabBtn("metricas", "📊 Métricas")}
          {tabBtn("pedidos", "🛵 Pedidos")}
          {tabBtn("usuarios", "👤 Usuarios")}
        </div>
        {loading ? <p style={{ color: theme.textDim, textAlign: "center", paddingTop: 60 }}>Cargando...</p> : <>
          {tab === "metricas" && (
            <div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 24 }}>
                {card("Pedidos hoy", stats.pedidosHoy, "🛵", "#f97316")}
                {card("Usuarios", stats.totalUsuarios, "👤", "#3b82f6")}
                {card("Restaurantes activos", stats.restaurantesActivos, "🍽️", "#22c55e")}
                {card("Repartidores online", stats.repartidoresActivos, "🟢", "#8b5cf6")}
              </div>
              <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <p style={{ color: theme.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 16px" }}>INGRESOS HOY (PEDIDOS ENTREGADOS)</p>
                <p style={{ color: "#22c55e", fontSize: 32, fontWeight: 900, margin: 0 }}>MXN ${Number(stats.ingresoHoy).toFixed(2)}</p>
              </div>
              <div style={{ marginTop: 16, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <p style={{ color: theme.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 16px" }}>REPARTIDORES ONLINE ({repartidoresOnline.length})</p>
                {repartidoresOnline.length === 0 ? <p style={{ color: theme.textDim, fontSize: 13 }}>Sin repartidores online</p> : repartidoresOnline.map((r:any) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <div>
                      <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{r.nombre || "Sin nombre"} {r.vehiculo === "moto" ? "🏍️" : r.vehiculo === "bici" ? "🚲" : "🚗"}</p>
                      <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>Placas: {r.placa || "—"} · Rating: ⭐{Number(r.rating||5).toFixed(1)}</p>
                    </div>
                    <span style={{ background: "#22c55e20", border: "1px solid #22c55e40", borderRadius: 20, color: "#22c55e", padding: "3px 12px", fontSize: 10, fontWeight: 700 }}>ONLINE</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <p style={{ color: theme.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 16px" }}>ÚLTIMOS 5 PEDIDOS</p>
                {pedidos.slice(0, 5).map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <div>
                      <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>#{p.numero} — {p.negocio_nombre || "—"}</p>
                      <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>{p.cliente_email || "—"}</p>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <span style={{ background: `${STATUS_COLOR[p.status] || "#64748b"}20`, color: STATUS_COLOR[p.status] || "#64748b", border: `1px solid ${STATUS_COLOR[p.status] || "#64748b"}40`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>{p.status}</span>
                      <p style={{ color: theme.textMuted, fontSize: 11, margin: "4px 0 0" }}>MXN ${Number(p.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "pedidos" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
                {["todos","nuevo","preparando","en_camino","entregado","cancelado"].map(s => (
                  <button key={s} onClick={() => setFiltroStatus(s)} style={{ background: filtroStatus === s ? (STATUS_COLOR[s] || "#3b82f6") : theme.surface, border: `1px solid ${filtroStatus === s ? (STATUS_COLOR[s] || "#3b82f6") : theme.border}`, borderRadius: 20, color: filtroStatus === s ? "#fff" : theme.textMuted, padding: "5px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{s}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {pedidosFiltrados.map(p => (
                  <div key={p.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: theme.text, fontSize: 13, fontWeight: 900, margin: "0 0 2px" }}>#{p.numero} — {p.negocio_nombre || "—"}</p>
                      <p style={{ color: theme.textDim, fontSize: 11, margin: "0 0 2px" }}>{p.cliente_email || "—"}</p>
                      <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{new Date(p.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <span style={{ background: `${STATUS_COLOR[p.status] || "#64748b"}20`, color: STATUS_COLOR[p.status] || "#64748b", border: `1px solid ${STATUS_COLOR[p.status] || "#64748b"}40`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>{p.status}</span>
                      <p style={{ color: theme.text, fontSize: 13, fontWeight: 900, margin: "6px 0 0" }}>MXN ${Number(p.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {pedidosFiltrados.length === 0 && <p style={{ color: theme.textDim, textAlign: "center", padding: "40px 0" }}>Sin pedidos</p>}
              </div>
            </div>
          )}
          {tab === "usuarios" && (
            <div>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o email..." style={{ width: "100%", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, padding: "12px 16px", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box" as const }} />
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {usuariosFiltrados.map(u => (
                  <div key={u.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{u.nombre || "Sin nombre"}</p>
                      <p style={{ color: theme.textDim, fontSize: 11, margin: "0 0 2px" }}>{u.email}</p>
                      <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>Rol: {u.rol} · {new Date(u.creado_en).toLocaleDateString("es-MX")}</p>
                    </div>
                    <button onClick={() => eliminarUsuario(u.id, u.nombre || u.email)} disabled={eliminando === u.id} style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, color: "#ef4444", padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, opacity: eliminando === u.id ? 0.5 : 1 }}>{eliminando === u.id ? "..." : "Eliminar"}</button>
                  </div>
                ))}
                {usuariosFiltrados.length === 0 && <p style={{ color: theme.textDim, textAlign: "center", padding: "40px 0" }}>Sin usuarios</p>}
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  )
}
// ─── CONFIG ──────────────────────────────────────────────────────────────────
function ConfigAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");

  const CAMPOS = [
    { clave: "soporte_email",    label: "Email de soporte",       icon: "📧", desc: "Correo visible en Ayuda y soporte dentro de la app" },
    { clave: "whatsapp",         label: "WhatsApp",               icon: "💬", desc: "URL completa: https://wa.me/52XXXXXXXXXX" },
    { clave: "privacidad_url",   label: "Politica de Privacidad", icon: "🔒", desc: "URL publica de la politica de privacidad" },
    { clave: "envio_precio_km",  label: "Precio por km (MXN)",    icon: "🛵", desc: "Costo de envio por kilometro. Actual: $12/km", numerico: true },
    { clave: "envio_minimo",     label: "Envio minimo (MXN)",     icon: "📍", desc: "Costo minimo de envio sin importar distancia. Actual: $35", numerico: true },
    { clave: "comision_pct",     label: "Comision app (%)",       icon: "💰", desc: "Porcentaje que retiene Batalla Group de cada venta. Actual: 18%", numerico: true },
    { clave: "fondo_pct",        label: "Fondo recuperacion (%)", icon: "🛡️", desc: "Porcentaje de la comision destinado al fondo. Actual: 20%", numerico: true },
    { clave: "retiro_minimo",    label: "Retiro minimo (MXN)",    icon: "💸", desc: "Monto minimo para solicitar retiro. Actual: $50", numerico: true },
    { clave: "mantenimiento", label: "Modo mantenimiento", icon: "🔧", desc: "Activa o desactiva la pantalla de mantenimiento en las 3 apps.", toggle: true },
  ];

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await db().query("SELECT clave, valor FROM app_config ORDER BY clave") as any[];
      const obj: Record<string, string> = {};
      for (const row of data) obj[row.clave] = row.valor ?? "";
      setConfig(obj);
    } catch (e: any) { setError("Error cargando config: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (clave: string) => {
    setSaving(clave); setError("");
    try {
      await db().query("UPDATE app_config SET valor = $1 WHERE clave = $2", [config[clave] ?? "", clave]);
      setSaved(clave);
      setTimeout(() => setSaved(null), 2000);
    } catch (e: any) { setError("Error guardando: " + e.message); }
    finally { setSaving(null); }
  };

  const btn = (color: string) => ({
    background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 8,
    color, padding: "8px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700,
  });

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>⚙️ Configuración</h1>
          <p style={{ color: theme.textDim, fontSize: 11, margin: "2px 0 0", letterSpacing: "0.15em" }}>VALORES GLOBALES DE LA APP</p>
        </div>
      </div>
      <div style={{ padding: "32px 28px", maxWidth: 600, margin: "0 auto" }}>
        {error && <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 20 }}>{error}</div>}
        {loading ? (
          <p style={{ color: theme.textDim, textAlign: "center", paddingTop: 60 }}>Cargando...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {(CAMPOS as any[]).map(({ clave, label, icon, desc, numerico, toggle: isToggle }) => (
              <div key={clave} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ color: theme.text, fontSize: 14, fontWeight: 900 }}>{label}</span>
                  {saved === clave && <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>✔ Guardado</span>}
                </div>
                <p style={{ color: theme.textDim, fontSize: 11, margin: "0 0 12px" }}>{desc}</p>
                {isToggle ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: config[clave] === "true" ? "#ef4444" : "#22c55e", borderRadius: 24, padding: "10px 24px", color: "#fff", fontWeight: 900, fontSize: 14 }}>
                      {config[clave] === "true" ? "EN MANTENIMIENTO" : "APPS FUNCIONANDO"}
                    </div>
                    <button onClick={() => { const n = config[clave] === "true" ? "false" : "true"; const msg = n === "true" ? "Activar mantenimiento en las 3 apps?" : "Desactivar mantenimiento?"; if (window.confirm(msg)) { setConfig(prev => ({ ...prev, [clave]: n })); setTimeout(() => guardar(clave), 100); } }} disabled={saving === clave} style={{ ...btn(config[clave] === "true" ? "#22c55e" : "#ef4444"), opacity: saving === clave ? 0.5 : 1 }}>
                      {saving === clave ? "..." : config[clave] === "true" ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type={(numerico as any) ? "number" : "text"} value={config[clave] ?? ""} onChange={e => setConfig(prev => ({ ...prev, [clave]: e.target.value }))} placeholder={"Valor de " + label + "..."} style={{ flex: 1, background: theme.bg, border: "1px solid " + theme.border, borderRadius: 8, color: theme.text, padding: "10px 14px", fontSize: 13, outline: "none" }} />
                    <button onClick={() => guardar(clave)} disabled={saving === clave} style={{ ...btn("#3b82f6"), opacity: saving === clave ? 0.5 : 1 }}>{saving === clave ? "..." : "Guardar"}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── SOPORTE ─────────────────────────────────────────────────────────────────
function SoporteAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [procesando, setProc] = useState<string | null>(null);
  const [notaAdmin, setNotaAdmin] = useState<Record<string, string>>({});
  const [expandido, setExp] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await db().query("SELECT * FROM reportes_soporte ORDER BY creado_en DESC LIMIT 300") as any[];
      setReportes(data);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); const iv = setInterval(cargar, 15000); return () => clearInterval(iv); }, []);

  const actualizar = async (id: string, status: string) => {
    setProc(id);
    try {
      await db().query("UPDATE reportes_soporte SET status=$1, nota_admin=$2, resuelto_en=$3 WHERE id=$4",
        [status, notaAdmin[id] || "", status === "resuelto" ? new Date().toISOString() : null, id]);
      await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const STATUS_COLOR: Record<string, string> = { nuevo: "#f59e0b", en_revision: "#3b82f6", resuelto: "#22c55e" };
  const STATUS_LABEL: Record<string, string> = { nuevo: "Nuevo", en_revision: "En revision", resuelto: "Resuelto" };
  const btn = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 as const });
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10 };

  const filtrados = reportes.filter(r => filtro === "todos" || r.status === filtro);
  const counts = { todos: reportes.length, nuevo: reportes.filter(r => r.status === "nuevo").length, en_revision: reportes.filter(r => r.status === "en_revision").length, resuelto: reportes.filter(r => r.status === "resuelto").length };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🎧 Soporte</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>REPORTES DE USUARIOS</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>TIEMPO REAL</span>
        </div>
      </div>
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {(["todos","nuevo","en_revision","resuelto"] as const).map(t => {
            const color = t === "todos" ? "#64748b" : STATUS_COLOR[t];
            return (
              <div key={t} onClick={() => setFiltro(t)} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0, cursor: "pointer", opacity: filtro === t ? 1 : 0.5 }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.15em", margin: "0 0 4px" }}>{t === "todos" ? "TODOS" : STATUS_LABEL[t].toUpperCase()}</p>
                <p style={{ color, fontSize: 24, fontWeight: 900, margin: 0 }}>{counts[t]}</p>
              </div>
            );
          })}
        </div>
        {loading ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Cargando...</p>
        : filtrados.length === 0 ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Sin reportes {filtro !== "todos" ? filtro : ""}</p>
        : filtrados.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExp(expandido === r.id ? null : r.id)}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${STATUS_COLOR[r.status] || "#64748b"}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {r.tipo === "Mi pedido no llego" ? "📦" : r.tipo === "El repartidor no llego" ? "🛵" : r.tipo === "Producto incorrecto o en mal estado" ? "⚠️" : r.tipo === "Cobro incorrecto" ? "💳" : r.tipo === "El restaurante no acepto mi pedido" ? "🍽️" : "💬"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const, marginBottom: 4 }}>
                  <span style={{ color: theme.text, fontSize: 14, fontWeight: 900 }}>{r.tipo}</span>
                  <span style={{ background: `${STATUS_COLOR[r.status]}20`, border: `1px solid ${STATUS_COLOR[r.status]}40`, borderRadius: 6, color: STATUS_COLOR[r.status], padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{STATUS_LABEL[r.status]}</span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>👤 {r.usuario_nombre || r.usuario_email || r.usuario_id}</p>
                {r.comentario && <p style={{ color: theme.textDim, fontSize: 12, margin: "0 0 2px", fontStyle: "italic" }}>"{r.comentario}"</p>}
                <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>{new Date(r.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <span style={{ color: theme.textDim, fontSize: 11, flexShrink: 0 }}>{expandido === r.id ? "▲" : "▼"}</span>
            </div>
            {expandido === r.id && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
                {r.nota_admin && <p style={{ color: "#3b82f6", fontSize: 12, background: "#3b82f615", border: "1px solid #3b82f630", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>Nota previa: {r.nota_admin}</p>}
                <textarea value={notaAdmin[r.id] || ""} onChange={e => setNotaAdmin(prev => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="Nota interna (opcional)..."
                  style={{ width: "100%", minHeight: 60, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 12px", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {r.status !== "en_revision" && <button onClick={() => actualizar(r.id, "en_revision")} disabled={procesando === r.id} style={{ ...btn("#3b82f6"), opacity: procesando === r.id ? 0.5 : 1 }}>🔍 En revision</button>}
                  {r.status !== "resuelto" && <button onClick={() => actualizar(r.id, "resuelto")} disabled={procesando === r.id} style={{ ...btn("#22c55e"), opacity: procesando === r.id ? 0.5 : 1 }}>✔ Marcar resuelto</button>}
                  {r.status !== "nuevo" && <button onClick={() => actualizar(r.id, "nuevo")} disabled={procesando === r.id} style={{ ...btn("#f59e0b"), opacity: procesando === r.id ? 0.5 : 1 }}>↩ Reabrir</button>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── CONTINGENCIAS ───────────────────────────────────────────────────────────
function ContingenciasAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const _API = "https://ya-voy-api.onrender.com";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [procesando, setProc] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [expandido, setExp] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetch(`${_API}/api/contingencias`).then(r => r.json());
      setItems(data);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); const iv = setInterval(cargar, 15000); return () => clearInterval(iv); }, []);

  const resolver = async (id: string) => {
    setProc(id);
    try {
      await fetch(`${_API}/api/contingencias/${id}/resolver`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota_admin: notas[id] || "" }),
      });
      await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const TIPO_LABEL: Record<string, string> = { no_pago: "⚠️ No pagó", accidente: "🚨 Accidente" };
  const TIPO_COLOR: Record<string, string> = { no_pago: "#f59e0b", accidente: "#ef4444" };
  const btn = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 as const });
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10 };

  const filtrados = items.filter(i => filtro === "todos" || i.status === filtro || i.tipo === filtro);
  const counts = { todos: items.length, pendiente: items.filter(i => i.status === "pendiente").length, resuelto: items.filter(i => i.status === "resuelto").length };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🚨 Contingencias</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>NO PAGO · ACCIDENTES · INCIDENTES</p>
        </div>
        {counts.pendiente > 0 && <span style={{ marginLeft: 8, background: "#ef444420", border: "1px solid #ef444440", borderRadius: 20, color: "#ef4444", padding: "3px 12px", fontSize: 11, fontWeight: 900 }}>{counts.pendiente} pendiente{counts.pendiente !== 1 ? "s" : ""}</span>}
      </div>
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" as const }}>
          {["todos","pendiente","resuelto","no_pago","accidente"].map(t => (
            <button key={t} onClick={() => setFiltro(t)} style={{ ...btn(filtro === t ? "#ef4444" : theme.textMuted), background: filtro === t ? "#ef444420" : theme.surface }}>
              {t === "no_pago" ? "⚠️ No pagó" : t === "accidente" ? "🚨 Accidentes" : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "pendiente" && counts.pendiente > 0 ? ` (${counts.pendiente})` : t === "todos" ? ` (${counts.todos})` : ""}
            </button>
          ))}
        </div>
        {loading ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Cargando...</p>
        : filtrados.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}><p style={{ fontSize: 36 }}>✅</p><p>Sin contingencias {filtro !== "todos" ? filtro : ""}</p></div>
        : filtrados.map(c => (
          <div key={c.id} style={{ ...card, borderLeft: `3px solid ${TIPO_COLOR[c.tipo] || "#64748b"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setExp(expandido === c.id ? null : c.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const, marginBottom: 4 }}>
                  <span style={{ color: theme.text, fontSize: 14, fontWeight: 900 }}>{TIPO_LABEL[c.tipo] || c.tipo}</span>
                  <span style={{ background: c.status === "resuelto" ? "#22c55e20" : "#f59e0b20", border: `1px solid ${c.status === "resuelto" ? "#22c55e40" : "#f59e0b40"}`, borderRadius: 20, color: c.status === "resuelto" ? "#22c55e" : "#f59e0b", padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{c.status}</span>
                  {c.monto_fondo > 0 && <span style={{ background: "#ef444420", border: "1px solid #ef444440", borderRadius: 20, color: "#ef4444", padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Fondo: -MXN ${Number(c.monto_fondo).toFixed(2)}</span>}
                </div>
                {c.descripcion && <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px", fontStyle: "italic" }}>"{c.descripcion}"</p>}
                <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>Pedido: {c.pedido_id?.slice(0,8)}... · {new Date(c.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <span style={{ color: theme.textDim, fontSize: 11 }}>{expandido === c.id ? "▲" : "▼"}</span>
            </div>
            {expandido === c.id && c.status === "pendiente" && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
                {c.foto_url && <a href={c.foto_url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginBottom: 10 }}><img src={c.foto_url} style={{ height: 120, borderRadius: 10, border: `1px solid ${theme.border}` }} /></a>}
                <textarea value={notas[c.id] || ""} onChange={e => setNotas(p => ({ ...p, [c.id]: e.target.value }))}
                  placeholder="Nota interna (opcional)..."
                  style={{ width: "100%", minHeight: 60, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 12px", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, marginBottom: 10 }} />
                <button onClick={() => resolver(c.id)} disabled={procesando === c.id} style={{ ...btn("#22c55e"), opacity: procesando === c.id ? 0.5 : 1 }}>
                  {procesando === c.id ? "..." : "✔ Marcar resuelto"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FONDO ────────────────────────────────────────────────────────────────────
function FondoAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const _API = "https://ya-voy-api.onrender.com";
  const [resumen, setResumen] = useState<any>(null);
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [montoUso, setMontoUso] = useState("");
  const [descUso, setDescUso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab] = useState<"resumen" | "log">("resumen");

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${_API}/api/fondo/resumen`).then(r => r.json()),
        fetch(`${_API}/api/fondo/log`).then(r => r.json()),
      ]);
      setResumen(r1); setLog(r2);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const registrarUso = async () => {
    const monto = parseFloat(montoUso);
    if (!monto || monto <= 0 || !descUso.trim()) return;
    if (resumen && monto > resumen.fondoDisponible) { setError("Monto excede el fondo disponible"); return; }
    setGuardando(true); setError("");
    try {
      await fetch(`${_API}/api/fondo/uso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto, descripcion: descUso }),
      });
      setMontoUso(""); setDescUso(""); await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setGuardando(false); }
  };

  const btn = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 as const });
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🛡️ Fondo de Recuperación</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>FONDO DE RECUPERACION · USO EXCLUSIVO BATALLA GROUP</p>
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 800, margin: "0 auto" }}>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["resumen", "log"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...btn(tab === t ? "#8b5cf6" : theme.textMuted), background: tab === t ? "#8b5cf620" : theme.surface }}>
              {t === "resumen" ? "📊 Resumen" : "📋 Historial"}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Cargando...</p> : tab === "resumen" && resumen ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
              <div style={{ ...card, borderLeft: "3px solid #22c55e" }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.15em", margin: "0 0 6px" }}>GANANCIAS NETAS BATALLA GROUP</p>
                <p style={{ color: "#22c55e", fontSize: 28, fontWeight: 900, margin: 0 }}>MXN ${Number(resumen.gananciasNetas).toFixed(2)}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: "4px 0 0" }}>Ganancias netas acumuladas</p>
              </div>
              <div style={{ ...card, borderLeft: "3px solid #8b5cf6" }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.15em", margin: "0 0 6px" }}>FONDO DISPONIBLE</p>
                <p style={{ color: "#8b5cf6", fontSize: 28, fontWeight: 900, margin: 0 }}>MXN ${Number(resumen.fondoDisponible).toFixed(2)}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: "4px 0 0" }}>Acumulado: ${Number(resumen.fondoAcumulado).toFixed(2)} · Usado: ${Number(resumen.fondoUsado).toFixed(2)}</p>
              </div>
              <div style={{ ...card, borderLeft: "3px solid #3b82f6" }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.15em", margin: "0 0 6px" }}>TOTAL COMISIONES (18%)</p>
                <p style={{ color: "#3b82f6", fontSize: 22, fontWeight: 900, margin: 0 }}>MXN ${Number(resumen.totalComision).toFixed(2)}</p>
              </div>
              <div style={{ ...card, borderLeft: "3px solid #ef4444" }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: "0.15em", margin: "0 0 6px" }}>FONDO USADO</p>
                <p style={{ color: "#ef4444", fontSize: 22, fontWeight: 900, margin: 0 }}>MXN ${Number(resumen.fondoUsado).toFixed(2)}</p>
              </div>
            </div>

            <div style={{ ...card, borderLeft: "3px solid #f59e0b" }}>
              <p style={{ color: theme.text, fontSize: 14, fontWeight: 900, margin: "0 0 14px" }}>💸 Registrar uso del fondo</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" as const }}>
                <input type="number" value={montoUso} onChange={e => setMontoUso(e.target.value)}
                  placeholder="Monto MXN" min="1" max={resumen.fondoDisponible}
                  style={{ flex: "0 0 140px", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 14px", fontSize: 13, outline: "none" }} />
                <input value={descUso} onChange={e => setDescUso(e.target.value)}
                  placeholder="Descripción (ej: Reembolso cliente #123)..."
                  style={{ flex: 1, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 14px", fontSize: 13, outline: "none", minWidth: 200 }} />
              </div>
              <button onClick={registrarUso} disabled={guardando || !montoUso || !descUso.trim()}
                style={{ ...btn("#f59e0b"), opacity: guardando || !montoUso || !descUso.trim() ? 0.4 : 1 }}>
                {guardando ? "Registrando..." : "Registrar uso"}
              </button>
              <p style={{ color: theme.textDim, fontSize: 11, margin: "10px 0 0" }}>⚠️ Solo Ramses puede usar este fondo. Cada uso queda registrado.</p>
            </div>
          </>
        ) : tab === "log" ? (
          <>
            {log.length === 0 && <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Sin movimientos</p>}
            {log.map(m => (
              <div key={m.id} style={{ ...card, borderLeft: `3px solid ${m.tipo === "ingreso" ? "#22c55e" : "#ef4444"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{m.tipo === "ingreso" ? "⬆️" : "⬇️"}</span>
                      <span style={{ color: theme.text, fontSize: 13, fontWeight: 900 }}>{m.descripcion || (m.tipo === "ingreso" ? "Ingreso" : "Uso")}</span>
                      <span style={{ background: m.tipo === "ingreso" ? "#22c55e20" : "#ef444420", border: `1px solid ${m.tipo === "ingreso" ? "#22c55e40" : "#ef444440"}`, borderRadius: 20, color: m.tipo === "ingreso" ? "#22c55e" : "#ef4444", padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>{m.tipo.toUpperCase()}</span>
                    </div>
                    <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{new Date(m.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span style={{ color: m.tipo === "ingreso" ? "#22c55e" : "#ef4444", fontSize: 18, fontWeight: 900 }}>
                    {m.tipo === "ingreso" ? "+" : "-"}MXN ${Number(m.monto).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── RETIROS ──────────────────────────────────────────────────────────────────
function RetirosAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const _API = "https://ya-voy-api.onrender.com";
  const [retiros, setRetiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProc] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [expandido, setExp] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetch(`${_API}/api/retiros`).then(r => r.json());
      setRetiros(data);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); const iv = setInterval(cargar, 15000); return () => clearInterval(iv); }, []);

  const actualizar = async (id: string, status: string) => {
    setProc(id);
    try {
      const res = await fetch(`${_API}/api/retiros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, nota_admin: notas[id] || "" }),
      });
      const retiro = await res.json();
      if (status === "pagado" || status === "aprobado" || status === "rechazado") {
        const titulo = status === "pagado" ? "Retiro pagado" : status === "aprobado" ? "Retiro aprobado" : "Retiro rechazado";
        const cuerpo = status === "pagado"
          ? "Tu retiro de $" + Number(retiro.monto).toFixed(2) + " MXN fue procesado"
          : status === "aprobado"
          ? "Tu retiro de $" + Number(retiro.monto).toFixed(2) + " MXN fue aprobado. Se procesara pronto."
          : "Tu solicitud de retiro fue rechazada. Contacta a soporte.";
        await fetch(`${_API}/api/notificaciones/push`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: retiro.actor_id, titulo, cuerpo, data: { tipo: "retiro", status } }),
        }).catch(() => {});
      }
      await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const STATUS_COLOR: Record<string, string> = { pendiente: "#f59e0b", aprobado: "#3b82f6", pagado: "#22c55e", rechazado: "#ef4444" };
  const STATUS_LABEL: Record<string, string> = { pendiente: "Pendiente", aprobado: "Aprobado", pagado: "Pagado", rechazado: "Rechazado" };
  const btn = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 as const });
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10 };

  const filtrados = retiros.filter(r => filtro === "todos" || r.status === filtro);
  const counts = {
    todos: retiros.length,
    pendiente: retiros.filter(r => r.status === "pendiente").length,
    aprobado: retiros.filter(r => r.status === "aprobado").length,
    pagado: retiros.filter(r => r.status === "pagado").length,
    rechazado: retiros.filter(r => r.status === "rechazado").length,
  };
  const totalPendiente = retiros.filter(r => r.status === "pendiente").reduce((a, r) => a + Number(r.monto), 0);

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>💸 Retiros</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>SOLICITUDES DE PAGO</p>
        </div>
        {counts.pendiente > 0 && (
          <span style={{ marginLeft: 8, background: "#f59e0b20", border: "1px solid #f59e0b40", borderRadius: 20, color: "#f59e0b", padding: "3px 12px", fontSize: 11, fontWeight: 900 }}>
            {counts.pendiente} pendiente{counts.pendiente !== 1 ? "s" : ""} · MXN ${totalPendiente.toFixed(2)}
          </span>
        )}
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 24 }}>
          {(["todos","pendiente","aprobado","pagado","rechazado"] as const).map(t => {
            const color = t === "todos" ? "#64748b" : STATUS_COLOR[t];
            return (
              <div key={t} onClick={() => setFiltro(t)} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0, cursor: "pointer", opacity: filtro === t ? 1 : 0.5 }}>
                <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: "0.15em", margin: "0 0 4px" }}>{t.toUpperCase()}</p>
                <p style={{ color, fontSize: 22, fontWeight: 900, margin: 0 }}>{counts[t as keyof typeof counts]}</p>
              </div>
            );
          })}
        </div>

        {loading ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Cargando...</p>
        : filtrados.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}><p style={{ fontSize: 36 }}>💸</p><p>Sin solicitudes {filtro !== "todos" ? filtro : ""}</p></div>
        : filtrados.map(r => (
          <div key={r.id} style={{ ...card, borderLeft: `3px solid ${STATUS_COLOR[r.status] || "#64748b"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setExp(expandido === r.id ? null : r.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{r.tipo_actor === "repartidor" ? "🛵" : "🍽️"}</span>
                  <span style={{ color: theme.text, fontSize: 14, fontWeight: 900 }}>{r.actor_nombre || r.actor_id}</span>
                  <span style={{ background: `${STATUS_COLOR[r.status]}20`, border: `1px solid ${STATUS_COLOR[r.status]}40`, borderRadius: 20, color: STATUS_COLOR[r.status], padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>{STATUS_LABEL[r.status]}</span>
                  <span style={{ background: "#8b5cf620", border: "1px solid #8b5cf640", borderRadius: 20, color: "#8b5cf6", padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>{r.tipo_actor}</span>
                </div>
                <p style={{ color: "#22c55e", fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>MXN ${Number(r.monto).toFixed(2)}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>{new Date(r.fecha_solicitud).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {r.nota_admin && <p style={{ color: "#3b82f6", fontSize: 11, margin: "4px 0 0" }}>Nota: {r.nota_admin}</p>}
              </div>
              <span style={{ color: theme.textDim, fontSize: 11 }}>{expandido === r.id ? "▲" : "▼"}</span>
            </div>

            {expandido === r.id && r.status === "pendiente" && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
                <textarea value={notas[r.id] || ""} onChange={e => setNotas(p => ({ ...p, [r.id]: e.target.value }))}
                  placeholder="Nota interna (opcional)..."
                  style={{ width: "100%", minHeight: 60, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: "10px 12px", fontSize: 12, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <button onClick={() => actualizar(r.id, "aprobado")} disabled={procesando === r.id} style={{ ...btn("#3b82f6"), opacity: procesando === r.id ? 0.5 : 1 }}>✔ Aprobar</button>
                  <button onClick={() => actualizar(r.id, "pagado")} disabled={procesando === r.id} style={{ ...btn("#22c55e"), opacity: procesando === r.id ? 0.5 : 1 }}>💸 Marcar pagado</button>
                  <button onClick={() => actualizar(r.id, "rechazado")} disabled={procesando === r.id} style={{ ...btn("#ef4444"), opacity: procesando === r.id ? 0.5 : 1 }}>✕ Rechazar</button>
                </div>
              </div>
            )}
            {expandido === r.id && r.status === "aprobado" && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
                <button onClick={() => actualizar(r.id, "pagado")} disabled={procesando === r.id} style={{ ...btn("#22c55e"), opacity: procesando === r.id ? 0.5 : 1 }}>💸 Confirmar pago realizado</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOQUEOS ─────────────────────────────────────────────────────────────────
function BloqueosAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const _API = "https://ya-voy-api.onrender.com";
  const [data, setData] = useState<{ usuarios: any[]; repartidores: any[]; negocios: any[] }>({ usuarios: [], repartidores: [], negocios: [] });
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProc] = useState<string | null>(null);
  const [tab, setTab] = useState<"activos" | "historial">("activos");
  const [notaDesbloqueo, setNota] = useState<Record<string, string>>({});
  const [modalBloqueo, setModalBloqueo] = useState<{ tipo: string; actorId: string; nombre: string } | null>(null);
  const [razonBloqueo, setRazon] = useState("");

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${_API}/api/bloqueos`).then(r => r.json()),
        fetch(`${_API}/api/bloqueos/historial`).then(r => r.json()),
      ]);
      setData(r1); setHistorial(r2);
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); const iv = setInterval(cargar, 15000); return () => clearInterval(iv); }, []);

  const desbloquear = async (tipo: string, actorId: string) => {
    setProc(actorId);
    try {
      await fetch(`${_API}/api/bloqueos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, actorId, nota: notaDesbloqueo[actorId] || "" }),
      });
      await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const bloquear = async () => {
    if (!modalBloqueo || !razonBloqueo.trim()) return;
    setProc(modalBloqueo.actorId);
    try {
      await fetch(`${_API}/api/bloqueos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: modalBloqueo.tipo, actorId: modalBloqueo.actorId, razon: razonBloqueo }),
      });
      setModalBloqueo(null); setRazon(""); await cargar();
    } catch (e: any) { setError("Error: " + e.message); }
    finally { setProc(null); }
  };

  const btn = (c: string) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 8, color: c, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700 as const });
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10 };
  const total = data.usuarios.length + data.repartidores.length + data.negocios.length;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={btn(theme.textMuted)}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🔒 Cuentas Bloqueadas</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: "2px 0 0", letterSpacing: "0.2em" }}>CONTROL DE ACCESO · YA VOY</p>
        </div>
        {total > 0 && <span style={{ marginLeft: 8, background: "#ef444420", border: "1px solid #ef444440", borderRadius: 20, color: "#ef4444", padding: "3px 12px", fontSize: 11, fontWeight: 900 }}>{total} bloqueado{total !== 1 ? "s" : ""}</span>}
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {error && <p style={{ color: "#ef4444", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["activos", "historial"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...btn(tab === t ? "#ef4444" : theme.textMuted), background: tab === t ? "#ef444420" : theme.surface }}>
              {t === "activos" ? "🔒 Bloqueados activos" : "📋 Historial"}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Cargando...</p> : tab === "activos" ? (
          <>
            {total === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: theme.textDim }}><p style={{ fontSize: 36 }}>✅</p><p>Sin cuentas bloqueadas</p></div>}

            {data.usuarios.length > 0 && (
              <>
                <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", margin: "0 0 10px" }}>CLIENTES ({data.usuarios.length})</p>
                {data.usuarios.map(u => (
                  <div key={u.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: theme.text, fontSize: 14, fontWeight: 900, margin: "0 0 2px" }}>👤 {u.nombre || "Sin nombre"}</p>
                        <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>{u.email}</p>
                        {u.razon_bloqueo && <p style={{ color: "#ef4444", fontSize: 11, margin: "0 0 4px" }}>Razón: {u.razon_bloqueo}</p>}
                        {u.bloqueado_en && <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>Bloqueado: {new Date(u.bloqueado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 160 }}>
                        <input value={notaDesbloqueo[u.id] || ""} onChange={e => setNota(p => ({ ...p, [u.id]: e.target.value }))}
                          placeholder="Nota (opcional)..." style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, padding: "6px 10px", fontSize: 11, outline: "none" }} />
                        <button onClick={() => desbloquear("usuario", u.id)} disabled={procesando === u.id} style={{ ...btn("#22c55e"), opacity: procesando === u.id ? 0.5 : 1 }}>
                          {procesando === u.id ? "..." : "✔ Desbloquear"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {data.repartidores.length > 0 && (
              <>
                <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", margin: "16px 0 10px" }}>REPARTIDORES ({data.repartidores.length})</p>
                {data.repartidores.map(r => (
                  <div key={r.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: theme.text, fontSize: 14, fontWeight: 900, margin: "0 0 2px" }}>🛵 {r.nombre || "Sin nombre"}</p>
                        <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>{r.email}</p>
                        {r.razon_bloqueo && <p style={{ color: "#ef4444", fontSize: 11, margin: 0 }}>Razón: {r.razon_bloqueo}</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 160 }}>
                        <input value={notaDesbloqueo[r.id] || ""} onChange={e => setNota(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Nota (opcional)..." style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, padding: "6px 10px", fontSize: 11, outline: "none" }} />
                        <button onClick={() => desbloquear("repartidor", r.id)} disabled={procesando === r.id} style={{ ...btn("#22c55e"), opacity: procesando === r.id ? 0.5 : 1 }}>
                          {procesando === r.id ? "..." : "✔ Desbloquear"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {data.negocios.length > 0 && (
              <>
                <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", margin: "16px 0 10px" }}>RESTAURANTES ({data.negocios.length})</p>
                {data.negocios.map(n => (
                  <div key={n.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: theme.text, fontSize: 14, fontWeight: 900, margin: "0 0 2px" }}>🍽️ {n.nombre}</p>
                        <p style={{ color: theme.textMuted, fontSize: 12, margin: "0 0 2px" }}>{n.direccion}</p>
                        {n.razon_bloqueo && <p style={{ color: "#ef4444", fontSize: 11, margin: 0 }}>Razón: {n.razon_bloqueo}</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 160 }}>
                        <input value={notaDesbloqueo[n.id] || ""} onChange={e => setNota(p => ({ ...p, [n.id]: e.target.value }))}
                          placeholder="Nota (opcional)..." style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, padding: "6px 10px", fontSize: 11, outline: "none" }} />
                        <button onClick={() => desbloquear("negocio", n.id)} disabled={procesando === n.id} style={{ ...btn("#22c55e"), opacity: procesando === n.id ? 0.5 : 1 }}>
                          {procesando === n.id ? "..." : "✔ Desbloquear"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {historial.length === 0 && <p style={{ color: theme.textDim, textAlign: "center", padding: "60px 0" }}>Sin historial</p>}
            {historial.map(h => (
              <div key={h.id} style={{ ...card, borderLeft: `3px solid ${h.resuelto ? "#22c55e" : "#ef4444"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 8 }}>
                  <div>
                    <p style={{ color: theme.text, fontSize: 13, fontWeight: 900, margin: "0 0 2px" }}>
                      {h.tipo_usuario === "usuario" ? "👤" : h.tipo_usuario === "repartidor" ? "🛵" : "🍽️"} {h.tipo_usuario} — <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 11 }}>{h.actor_id}</span>
                    </p>
                    {h.razon && <p style={{ color: "#ef4444", fontSize: 11, margin: "0 0 2px" }}>Razón: {h.razon}</p>}
                    {h.nota_desbloqueo && <p style={{ color: "#22c55e", fontSize: 11, margin: "0 0 2px" }}>Nota desbloqueo: {h.nota_desbloqueo}</p>}
                    <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{new Date(h.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span style={{ background: h.resuelto ? "#22c55e20" : "#ef444420", border: `1px solid ${h.resuelto ? "#22c55e40" : "#ef444440"}`, borderRadius: 20, color: h.resuelto ? "#22c55e" : "#ef4444", padding: "3px 12px", fontSize: 10, fontWeight: 700 }}>
                    {h.resuelto ? "Desbloqueado" : "Bloqueado"}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal bloqueo manual */}
      {modalBloqueo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, maxWidth: 440, width: "100%" }}>
            <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 900, margin: "0 0 8px" }}>🔒 Bloquear {modalBloqueo.tipo}</h3>
            <p style={{ color: theme.textMuted, fontSize: 13, margin: "0 0 16px" }}>{modalBloqueo.nombre}</p>
            <textarea value={razonBloqueo} onChange={e => setRazon(e.target.value)} placeholder="Razón del bloqueo (requerido)..."
              style={{ width: "100%", minHeight: 80, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, padding: "12px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={bloquear} disabled={!razonBloqueo.trim() || !!procesando} style={{ ...btn("#ef4444"), opacity: !razonBloqueo.trim() ? 0.4 : 1, flex: 1 }}>Confirmar bloqueo</button>
              <button onClick={() => { setModalBloqueo(null); setRazon(""); }} style={{ ...btn(theme.textMuted), flex: 1 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function YaVoy({ onBack, theme }: Props) {
  const [sub, setSub] = useState<SubApp>(null);
  const [resumenRapido, setResumenRapido] = useState<any>(null);
  useEffect(() => {
    db().query([
      "SELECT",
      "(SELECT COUNT(*) FROM pedidos WHERE creado_en::date = CURRENT_DATE) as pedidos_hoy,",
      "(SELECT COUNT(*) FROM pedidos WHERE status IN ('nuevo','preparando','en_camino','listo')) as pedidos_activos,",
      "(SELECT COALESCE(SUM(total),0) FROM pedidos WHERE creado_en::date = CURRENT_DATE AND status = 'entregado') as ingresos_hoy,",
      "(SELECT nombre FROM viveres WHERE status = 'aprobado' ORDER BY (SELECT COUNT(*) FROM pedidos WHERE negocio_id = viveres.id AND creado_en > NOW() - INTERVAL '7 days') DESC LIMIT 1) as top_restaurante,",
      "(SELECT COUNT(*) FROM retiros WHERE status = 'pendiente') as retiros_pendientes,",
      "(SELECT COUNT(*) FROM solicitudes WHERE status = 'pendiente') as solicitudes_pendientes"
    ].join(" ")).then((r) => setResumenRapido(r[0])).catch(() => {});
  }, []);
  if (sub === "restaurante") return <RestauranteAdmin onBack={() => setSub(null)} theme={theme} />;
  if (sub === "repartidor")  return <RepartidorAdmin  onBack={() => setSub(null)} theme={theme} />;
  if (sub === "config")       return <ConfigAdmin       onBack={() => setSub(null)} theme={theme} />;
  if (sub === "cliente")      return <ClienteAdmin      onBack={() => setSub(null)} theme={theme} />;
  if (sub === "soporte")      return <SoporteAdmin      onBack={() => setSub(null)} theme={theme} />;
  if (sub === "bloqueos")     return <BloqueosAdmin     onBack={() => setSub(null)} theme={theme} />;
  if (sub === "retiros")      return <RetirosAdmin      onBack={() => setSub(null)} theme={theme} />;
  if (sub === "fondo")        return <FondoAdmin        onBack={() => setSub(null)} theme={theme} />;
  if (sub === "contingencias") return <ContingenciasAdmin onBack={() => setSub(null)} theme={theme} />;
  if (sub) {
    const app = SUBAPPS.find(a => a.id === sub)!;
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSub(null)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>← Volver</button>
          <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>{app.icon} {app.name}</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 65px)", gap: 20 }}>
          <div style={{ fontSize: 64 }}>{app.icon}</div>
          <p style={{ color: theme.textDim, fontSize: 14 }}>Esta sección está en desarrollo.</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>🚀 Ya Voy</h1>
          <p style={{ color: theme.textDim, fontSize: 11, margin: "2px 0 0", letterSpacing: "0.15em" }}>PLATAFORMA DE DELIVERY</p>
        </div>
      </div>
      <div style={{ padding: "32px 28px", maxWidth: 700, margin: "0 auto" }}>
        {resumenRapido && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", margin: "0 0 12px" }}>RESUMEN HOY</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 10 }}>
              {([
                { label: "Pedidos hoy", value: String(resumenRapido.pedidos_hoy || 0), icon: "🛵", color: "#f97316" },
                { label: "Activos ahora", value: String(resumenRapido.pedidos_activos || 0), icon: "🔥", color: "#ef4444" },
                { label: "Ingresos hoy", value: "MXN $" + Number(resumenRapido.ingresos_hoy || 0).toFixed(0), icon: "💰", color: "#22c55e" },
                { label: "Retiros pendientes", value: String(resumenRapido.retiros_pendientes || 0), icon: "💸", color: Number(resumenRapido.retiros_pendientes) > 0 ? "#f59e0b" : "#64748b" },
                { label: "Solicitudes", value: String(resumenRapido.solicitudes_pendientes || 0), icon: "📋", color: Number(resumenRapido.solicitudes_pendientes) > 0 ? "#3b82f6" : "#64748b" },
              ] as {label:string;value:string;icon:string;color:string}[]).map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: theme.surface, border: "1px solid " + theme.border, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <p style={{ color, fontSize: 20, fontWeight: 900, margin: "0 0 2px" }}>{value}</p>
                  <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{label.toUpperCase()}</p>
                </div>
              ))}
            </div>
            {resumenRapido.top_restaurante && (
              <div style={{ background: theme.surface, border: "1px solid " + theme.border, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <div>
                  <p style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, margin: "0 0 2px" }}>RESTAURANTE MAS ACTIVO (7 DIAS)</p>
                  <p style={{ color: theme.text, fontSize: 14, fontWeight: 900, margin: 0 }}>{resumenRapido.top_restaurante}</p>
                </div>
              </div>
            )}
          </div>
        )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {SUBAPPS.map(app => (
            <div key={app.id} onClick={() => setSub(app.id as SubApp)}
              style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "24px 20px", cursor: "pointer" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{app.icon}</div>
              <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 900, margin: "0 0 6px" }}>{app.name}</h3>
              <p style={{ color: theme.textDim, fontSize: 12, margin: 0, lineHeight: 1.5 }}>{app.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

