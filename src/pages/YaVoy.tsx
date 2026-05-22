import { useState, useEffect } from 'react';
import type { Theme } from '../App';
import { neon } from '@neondatabase/serverless';

interface Props { onBack: () => void; theme: Theme; }
type SubApp = 'restaurante' | 'repartidor' | 'cliente' | null;

interface Solicitud {
  id: string;
  usuario_id: string;
  tipo: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  datos: {
    nombre_negocio?: string;
    tipo_negocio?: string;
    telefono?: string;
    direccion?: string;
    foto_url?: string;
    nombre_dueno?: string;
    email?: string;
  };
  documentos: any;
  razon_rechazo?: string;
  creado_en: string;
}

const SUBAPPS = [
  { id: 'restaurante', name: 'Ya Voy Restaurante', icon: '🍽️', desc: 'Solicitudes y panel de restaurantes' },
  { id: 'repartidor',  name: 'Ya Voy Repartidor',  icon: '🛵', desc: 'App para repartidores en ruta' },
  { id: 'cliente',     name: 'Ya Voy Cliente',      icon: '📱', desc: 'App para pedir comida a domicilio' },
];

const STATUS_COLOR: Record<string, string> = { pendiente: '#f59e0b', aprobado: '#22c55e', rechazado: '#ef4444' };
const STATUS_LABEL: Record<string, string> = { pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado' };

function RestauranteAdmin({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [tab, setTab] = useState<'pendientes' | 'aprobados' | 'rechazados'>('pendientes');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [razon, setRazon] = useState('');
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true); setError('');
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL!);
      const data = await sql('SELECT s.*, u.email as usuario_email FROM solicitudes s LEFT JOIN usuarios u ON u.id = s.usuario_id WHERE s.tipo = $1 ORDER BY s.creado_en DESC', ['negocio']);
      setSolicitudes(data as Solicitud[]);
    } catch (err: any) {
      setError('Error al cargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const aprobar = async (s: Solicitud) => {
    setProcesando(s.id);
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL!);
      await sql('INSERT INTO viveres (owner_id, nombre_negocio, tipo_negocio, telefono, direccion, foto_url, status) VALUES ($1,$2,$3,$4,$5,$6,$7)', [s.usuario_id, s.datos?.nombre_negocio ?? '', s.datos?.tipo_negocio ?? '', s.datos?.telefono ?? '', s.datos?.direccion ?? '', s.datos?.foto_url ?? '', 'aprobado']);
      await sql('UPDATE solicitudes SET status = $1 WHERE id = $2', ['aprobado', s.id]);
      await cargar();
    } catch (err: any) {
      setError('Error al aprobar: ' + err.message);
    } finally {
      setProcesando(null);
    }
  };

  const rechazar = async (id: string) => {
    if (!razon.trim()) return;
    setProcesando(id);
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL!);
      await sql('UPDATE solicitudes SET status = $1, razon_rechazo = $2 WHERE id = $3', ['rechazado', razon, id]);
      setRechazando(null); setRazon('');
      await cargar();
    } catch (err: any) {
      setError('Error al rechazar: ' + err.message);
    } finally {
      setProcesando(null);
    }
  };

  const filtradas = solicitudes.filter(s =>
    tab === 'pendientes' ? s.status === 'pendiente' :
    tab === 'aprobados'  ? s.status === 'aprobado'  : s.status === 'rechazado'
  );

  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 12 };
  const tag  = (color: string) => ({ background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 6, color, padding: '2px 10px', fontSize: 10, fontWeight: 700 as const, display: 'inline-block' });
  const btn  = (color: string) => ({ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 8, color, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 as const });

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '7px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🍽️ Ya Voy Restaurante</h1>
          <p style={{ color: theme.textDim, fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>SOLICITUDES DE REGISTRO · NEON</p>
        </div>
        <button onClick={cargar} style={{ marginLeft: 'auto', ...btn('#3b82f6') }}>↻ Actualizar</button>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {(['pendientes','aprobados','rechazados'] as const).map(t => {
            const count = solicitudes.filter(s =>
              t === 'pendientes' ? s.status === 'pendiente' :
              t === 'aprobados'  ? s.status === 'aprobado'  : s.status === 'rechazado'
            ).length;
            const color = t === 'pendientes' ? '#f59e0b' : t === 'aprobados' ? '#22c55e' : '#ef4444';
            return (
              <div key={t} onClick={() => setTab(t)} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0, cursor: 'pointer', opacity: tab === t ? 1 : 0.5 }}>
                <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px' }}>{t.toUpperCase()}</p>
                <p style={{ color, fontSize: 28, fontWeight: 900, margin: 0 }}>{count}</p>
              </div>
            );
          })}
        </div>

        {error && <p style={{ color: '#ef4444', background: '#ef444420', border: '1px solid #ef444440', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>{error}</p>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textDim }}>Cargando solicitudes...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textDim }}>
            <p style={{ fontSize: 32, margin: '0 0 12px' }}>📭</p>
            <p>No hay solicitudes {tab}</p>
          </div>
        ) : filtradas.map(s => (
          <div key={s.id} style={card}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
              {s.datos?.foto_url ? (
                <img src={s.datos.foto_url} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: '#f9731620', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🍽️</div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' as const }}>
                  <span style={{ color: theme.text, fontSize: 16, fontWeight: 900 }}>{s.datos?.nombre_negocio || 'Sin nombre'}</span>
                  <span style={tag(STATUS_COLOR[s.status])}>{STATUS_LABEL[s.status]}</span>
                  {s.datos?.tipo_negocio && <span style={tag('#8b5cf6')}>{s.datos.tipo_negocio}</span>}
                </div>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: '0 0 2px' }}>👤 {s.datos?.nombre_dueno || '—'} · 📧 {s.datos?.email || '—'}</p>
                <p style={{ color: theme.textMuted, fontSize: 12, margin: '0 0 2px' }}>📞 {s.datos?.telefono || '—'} · 📍 {s.datos?.direccion || '—'}</p>
                <p style={{ color: theme.textDim, fontSize: 11, margin: '4px 0 0' }}>
                  Enviada: {new Date(s.creado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {s.razon_rechazo && (
                  <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0', background: '#ef444415', padding: '6px 10px', borderRadius: 8 }}>
                    Razón de rechazo: {s.razon_rechazo}
                  </p>
                )}
              </div>
              {s.status === 'pendiente' && (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, flexShrink: 0 }}>
                  <button onClick={() => aprobar(s)} disabled={procesando === s.id} style={{ ...btn('#22c55e'), opacity: procesando === s.id ? 0.5 : 1 }}>
                    {procesando === s.id ? 'Procesando...' : '✔ Aprobar'}
                  </button>
                  <button onClick={() => setRechazando(s.id)} disabled={procesando === s.id} style={{ ...btn('#ef4444'), opacity: procesando === s.id ? 0.5 : 1 }}>
                    ✕ Rechazar
                  </button>
                </div>
              )}
            </div>
            {rechazando === s.id && (
              <div style={{ marginTop: 14, padding: 14, background: '#ef444410', border: '1px solid #ef444430', borderRadius: 10 }}>
                <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Motivo del rechazo:</p>
                <textarea value={razon} onChange={e => setRazon(e.target.value)}
                  placeholder="Escribe el motivo para que el negocio pueda corregirlo..."
                  style={{ width: '100%', minHeight: 80, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => rechazar(s.id)} disabled={!razon.trim() || procesando === s.id} style={{ ...btn('#ef4444'), opacity: !razon.trim() ? 0.4 : 1 }}>Confirmar rechazo</button>
                  <button onClick={() => { setRechazando(null); setRazon(''); }} style={btn(theme.textMuted)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function YaVoy({ onBack, theme }: Props) {
  const [sub, setSub] = useState<SubApp>(null);

  if (sub === 'restaurante') return <RestauranteAdmin onBack={() => setSub(null)} theme={theme} />;

  if (sub) {
    const app = SUBAPPS.find(a => a.id === sub)!;
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setSub(null)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>{app.icon} {app.name}</h1>
            <p style={{ color: theme.textDim, fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>MÓDULO EN DESARROLLO</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px)', gap: 20 }}>
          <div style={{ fontSize: 64 }}>{app.icon}</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: theme.text, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>{app.name}</h2>
            <p style={{ color: theme.textDim, fontSize: 14, margin: 0 }}>Esta sección está en desarrollo.</p>
          </div>
          <button onClick={() => setSub(null)} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: 10, color: '#fb923c', padding: '12px 28px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>← Regresar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
        <div>
          <h1 style={{ color: theme.text, fontSize: 18, fontWeight: 900, margin: 0 }}>🛵 Ya Voy!</h1>
          <p style={{ color: theme.textDim, fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>PLATAFORMA DE REPARTO</p>
        </div>
      </div>
      <div style={{ padding: '48px 40px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: theme.textDim, fontSize: 11, letterSpacing: '0.35em', marginBottom: 8 }}>── APLICACIONES</p>
          <h2 style={{ color: theme.text, fontSize: 32, fontWeight: 900, margin: 0 }}>Ya Voy!</h2>
          <p style={{ color: theme.textDim, fontSize: 13, marginTop: 8 }}>Selecciona una aplicación para administrar</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {SUBAPPS.map(app => (
            <div key={app.id} onClick={() => setSub(app.id as SubApp)}
              style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' as const, overflow: 'hidden' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(249,115,22,0.45)'; el.style.background = 'rgba(249,115,22,0.08)'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(249,115,22,0.15)'; el.style.background = 'rgba(249,115,22,0.04)'; el.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{app.icon}</div>
              <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>{app.name}</h3>
              <p style={{ color: theme.textDim, fontSize: 12, margin: '0 0 20px', lineHeight: 1.5 }}>{app.desc}</p>
              {app.id === 'restaurante' ? (
                <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, padding: '4px 12px', color: '#22c55e', fontSize: 11, letterSpacing: '0.15em' }}>ACTIVO · NEON</div>
              ) : (
                <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '4px 12px', color: '#fb923c', fontSize: 11, letterSpacing: '0.15em' }}>EN DESARROLLO</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
