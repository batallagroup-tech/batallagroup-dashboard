import { useState, useEffect } from "react";
import type { Theme } from "../App";
import { neon } from "@neondatabase/serverless";

interface Props { onBack: () => void; theme: Theme }
type SubApp = "restaurante" | "repartidor" | "cliente" | null;

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
        await db().query("UPDATE viveres SET nombre=$1, tipo=$2, direccion=$3, imagen_url=$4, status='aprobado' WHERE owner_id=$5",
          [s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", s.usuario_id]);
      } else {
        await db().query("INSERT INTO viveres (owner_id, nombre, tipo, direccion, imagen_url, status) VALUES ($1,$2,$3,$4,$5,$6)",
          [s.usuario_id, s.datos?.nombre_negocio ?? "", (s.datos?.tipo_negocio ?? "").toLowerCase() === "restaurante" ? "restaurante" : "tienda", s.datos?.direccion ?? "", s.datos?.foto_url ?? "", "aprobado"]);
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

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function YaVoy({ onBack, theme }: Props) {
  const [sub, setSub] = useState<SubApp>(null);
  if (sub === "restaurante") return <RestauranteAdmin onBack={() => setSub(null)} theme={theme} />;
  if (sub === "repartidor")  return <RepartidorAdmin  onBack={() => setSub(null)} theme={theme} />;
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

