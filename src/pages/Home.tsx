import { useState } from 'react';
import type { Theme } from '../App';
import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  theme: Theme;
  notifBell?: React.ReactNode;
  onSearch?: () => void;
}

const APPS = [
  {
    id: 'vor' as Screen,
    name: 'VOR — Verdad o Reto',
    desc: 'Gestión de retos, verdades y contenido del juego',
    icon: '🎮',
    color: '#e91e8c',
    borderIdle: 'rgba(233,30,140,0.15)',
    borderHover: 'rgba(233,30,140,0.45)',
    bgHover: 'rgba(233,30,140,0.05)',
    status: 'LIVE',
    statusColor: '#22c55e',
    stats: [
      { label: 'Retos', value: '2,216' },
      { label: 'Modos', value: '13' },
      { label: 'Versión', value: '1.4.0' },
    ],
  },
  {
    id: 'barrio' as Screen,
    name: 'BarrioAlerta',
    desc: 'Monitoreo de incidentes y reportes de la comunidad',
    icon: '🚨',
    color: '#3b82f6',
    borderIdle: 'rgba(59,130,246,0.15)',
    borderHover: 'rgba(59,130,246,0.45)',
    bgHover: 'rgba(59,130,246,0.05)',
    status: 'LIVE',
    statusColor: '#22c55e',
    stats: [
      { label: 'Incidentes', value: '—' },
      { label: 'Usuarios', value: '—' },
      { label: 'Reportes', value: '—' },
    ],
  },
  {
    id: 'yavoy' as Screen,
    name: 'Ya Voy!',
    desc: 'Plataforma de reparto — cliente, restaurante y repartidor',
    icon: '🛵',
    color: '#f97316',
    borderIdle: 'rgba(249,115,22,0.15)',
    borderHover: 'rgba(249,115,22,0.45)',
    bgHover: 'rgba(249,115,22,0.05)',
    status: 'DEV',
    statusColor: '#f59e0b',
    stats: [
      { label: 'Sub-apps', value: '9' },
      { label: 'Pedidos', value: '—' },
      { label: 'Estado', value: 'DEV' },
    ],
  },
];

const KPI = [
  { label: 'Apps activas', value: '3', sub: '+1 este mes', color: '#e91e8c' },
  { label: 'Uptime global', value: '99.8%', sub: 'Últimos 30 días', color: '#22c55e' },
  { label: 'Versión latest', value: '1.4.0', sub: 'VOR Dashboard', color: '#3b82f6' },
  { label: 'Entorno', value: 'PROD', sub: 'Vercel · main', color: '#f97316' },
];

const SYSTEM = [
  { label: 'Vercel', ok: true },
  { label: 'Supabase DB', ok: true },
  { label: 'Auth Service', ok: true },
  { label: 'CDN / Edge', ok: true },
];

export default function Home({ onNavigate, onLogout, notifBell, onSearch, theme }: Props) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const now = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif", color: theme.text }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: theme.bg === '#050508' ? 'rgba(5,5,8,0.92)' : 'rgba(240,240,248,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${theme.border}`, padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ color: theme.text, fontSize: 15, fontWeight: 900, letterSpacing: '3px' }}>BATALLA</span>
            <span style={{ color: theme.textMuted, fontSize: 15, fontWeight: 900, letterSpacing: '3px' }}>GROUP</span>
          </div>
          <div style={{ width: 1, height: 16, background: theme.border }} />
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em' }}>PANEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: '#22c55e', fontSize: 9, letterSpacing: '0.2em', fontWeight: 700 }}>TODOS OK</span>
          </div>
          <button onClick={onSearch} title="Buscar (Ctrl+K)" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, fontSize: 11, cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
            🔍 <span style={{ fontSize: 9, letterSpacing: '0.1em', color: theme.textDim }}>CTRL+K</span>
          </button>
          {notifBell}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '5px 12px' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #e91e8c, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>RB</div>
            <div>
              <p style={{ margin: 0, color: theme.text, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>Ramses</p>
              <p style={{ margin: 0, color: theme.textDim, fontSize: 9, letterSpacing: '0.1em', lineHeight: 1.4 }}>ADMIN</p>
            </div>
          </div>
          <button onClick={onLogout}
            style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textDim, fontSize: 11, cursor: 'pointer', padding: '6px 12px', fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = theme.textDim; (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border; }}
          >Salir</button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '36px 40px 60px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 6px' }}>CENTRO DE CONTROL</p>
          <h1 style={{ color: theme.text, fontSize: 30, fontWeight: 900, margin: '0 0 4px' }}>{greeting}, Ramses</h1>
          <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.1em', margin: 0 }}>{now}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
          {KPI.map(k => (
            <div key={k.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '18px 20px', borderLeft: `3px solid ${k.color}` }}>
              <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.25em', margin: '0 0 8px', textTransform: 'uppercase' as const }}>{k.label}</p>
              <p style={{ color: theme.text, fontSize: 26, fontWeight: 900, margin: '0 0 3px', lineHeight: 1 }}>{k.value}</p>
              <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.35em', margin: '0 0 12px' }}>APLICACIONES CONECTADAS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12, marginBottom: 28 }}>
          {APPS.map(app => (
            <div key={app.id} onClick={() => onNavigate(app.id)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
              style={{ background: hoveredApp === app.id ? app.bgHover : theme.surface, border: `1px solid ${hoveredApp === app.id ? app.borderHover : app.borderIdle}`, borderRadius: 14, padding: '22px 22px 18px', cursor: 'pointer', transition: 'all 0.18s ease', transform: hoveredApp === app.id ? 'translateY(-2px)' : 'translateY(0)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: app.color, opacity: 0.4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${app.color}12`, border: `1px solid ${app.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{app.icon}</div>
                  <div>
                    <h3 style={{ color: theme.text, fontSize: 15, fontWeight: 900, margin: '0 0 3px' }}>{app.name}</h3>
                    <p style={{ color: theme.textMuted, fontSize: 11, margin: 0, lineHeight: 1.4 }}>{app.desc}</p>
                  </div>
                </div>
                <span style={{ background: `${app.statusColor}15`, border: `1px solid ${app.statusColor}35`, borderRadius: 6, padding: '2px 8px', color: app.statusColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', flexShrink: 0 }}>{app.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {app.stats.map(s => (
                  <div key={s.label} style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.2em', margin: '0 0 5px', textTransform: 'uppercase' as const }}>{s.label}</p>
                    <p style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: 12 }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 14px' }}>ACCESO RÁPIDO</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Analytics', icon: '📊', screen: 'analytics' as Screen, color: '#3b82f6' },
                { label: 'Versiones', icon: '📋', screen: 'versions' as Screen, color: '#8b5cf6' },
              ].map(l => (
                <button key={l.label} onClick={() => onNavigate(l.screen)} style={{ background: `${l.color}10`, border: `1px solid ${l.color}25`, borderRadius: 8, padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  <span style={{ color: l.color, fontSize: 12, fontWeight: 700 }}>{l.label}</span>
                </button>
              ))}
              {[
                { label: 'Vercel', icon: '▲', url: 'https://vercel.com/dashboard' },
                { label: 'Supabase', icon: '⚡', url: 'https://supabase.com/dashboard' },
                { label: 'GitHub', icon: '⬡', url: 'https://github.com' },
                { label: 'Analytics', icon: '📈', url: 'https://vercel.com/analytics' },
              ].map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  <span style={{ color: theme.textMuted, fontSize: 12 }}>{l.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 14px' }}>ESTADO DEL SISTEMA</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {SYSTEM.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${theme.border}`, borderRadius: 8 }}>
                  <span style={{ color: theme.textMuted, fontSize: 12 }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                    <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 600 }}>Operacional</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 20px' }}>
            <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 14px' }}>BUILD INFO</p>
            {[
              { label: 'Versión', value: 'v1.4.0' },
              { label: 'Branch', value: 'main' },
              { label: 'Stack', value: 'React+Vite' },
              { label: 'Deploy', value: 'Vercel' },
              { label: 'DB', value: 'Supabase' },
              { label: 'DB2', value: 'Neon PG' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.textDim, fontSize: 11 }}>{r.label}</span>
                <span style={{ color: theme.textMuted, fontSize: 11, fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${theme.border}`, padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>© 2026 BatallaGroup</span>
        <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>V 1.4.0 · PROD</span>
      </footer>
    </div>
  );
}
