import { useState } from 'react';
import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
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
    borderIdle: 'rgba(233,30,140,0.18)',
    borderHover: 'rgba(233,30,140,0.5)',
    bgHover: 'rgba(233,30,140,0.06)',
    topLine: '#e91e8c',
    accent: '#180010',
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
    borderIdle: 'rgba(59,130,246,0.18)',
    borderHover: 'rgba(59,130,246,0.5)',
    bgHover: 'rgba(59,130,246,0.06)',
    topLine: '#3b82f6',
    accent: '#081020',
    status: 'LIVE',
    statusColor: '#22c55e',
    stats: [
      { label: 'Incidentes', value: '—' },
      { label: 'Usuarios', value: '—' },
      { label: 'Reportes', value: '—' },
    ],
  },
  {
    id: 'yavoy-admin' as Screen,
    name: 'Ya Voy! Admin',
    desc: 'Restaurantes, menús y repartidores',
    icon: '🏪',
    color: '#f97316',
    borderIdle: 'rgba(249,115,22,0.18)',
    borderHover: 'rgba(249,115,22,0.5)',
    bgHover: 'rgba(249,115,22,0.06)',
    topLine: '#f97316',
    accent: '#1a0e00',
    status: 'DEV',
    statusColor: '#f59e0b',
    stats: [
      { label: 'Restaurantes', value: '3' },
      { label: 'Repartidores', value: '3' },
      { label: 'Platillos', value: '5' },
    ],
  },
  {
    id: 'analytics' as Screen,
    name: 'Analytics',
    desc: 'Gráficas de crecimiento y métricas',
    icon: '📊',
    color: '#22c55e',
    borderIdle: 'rgba(34,197,94,0.18)',
    borderHover: 'rgba(34,197,94,0.5)',
    bgHover: 'rgba(34,197,94,0.06)',
    topLine: '#22c55e',
    accent: '#001a0a',
    status: 'LIVE',
    statusColor: '#22c55e',
    stats: [
      { label: 'Apps', value: '3' },
      { label: 'Usuarios', value: '89+' },
      { label: 'Semanas', value: '8' },
    ],
  },
  {
    id: 'versions' as Screen,
    name: 'Versiones',
    desc: 'Changelog y gestión de versiones',
    icon: '📋',
    color: '#8b5cf6',
    borderIdle: 'rgba(139,92,246,0.18)',
    borderHover: 'rgba(139,92,246,0.5)',
    bgHover: 'rgba(139,92,246,0.06)',
    topLine: '#8b5cf6',
    accent: '#0e001a',
    status: 'LIVE',
    statusColor: '#22c55e',
    stats: [
      { label: 'Versiones', value: '3' },
      { label: 'Apps', value: '3' },
      { label: 'Último', value: 'v1.4.0' },
    ],
  },
  {
    id: 'yavoy' as Screen,
    name: 'Ya Voy!',
    desc: 'Plataforma de reparto — cliente, restaurante y repartidor',
    icon: '🛵',
    color: '#f97316',
    borderIdle: 'rgba(249,115,22,0.18)',
    borderHover: 'rgba(249,115,22,0.5)',
    bgHover: 'rgba(249,115,22,0.06)',
    topLine: '#f97316',
    accent: '#1a0e00',
    status: 'DEV',
    statusColor: '#f59e0b',
    stats: [
      { label: 'Apps', value: '3' },
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

const ACTIVITY = [
  { time: 'Hace 2 min', msg: 'Deploy exitoso — batallagroup-dashboard', type: 'success' },
  { time: 'Hace 18 min', msg: 'Push a main — fix: Home.tsx reescrito limpio', type: 'info' },
  { time: 'Hace 1 h', msg: 'Ya Voy! agregado al panel — 3 sub-apps', type: 'info' },
  { time: 'Hace 3 h', msg: 'VORDashboard v1.4.0 actualizado', type: 'success' },
  { time: 'Ayer', msg: 'BarrioAlerta conectado a Supabase', type: 'success' },
];

const SYSTEM = [
  { label: 'Vercel', status: 'Operacional', ok: true },
  { label: 'Supabase DB', status: 'Operacional', ok: true },
  { label: 'Auth Service', status: 'Operacional', ok: true },
  { label: 'CDN / Edge', status: 'Operacional', ok: true },
];

const QUICKLINKS = [
  { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', icon: '▲' },
  { label: 'Supabase Studio', url: 'https://supabase.com/dashboard', icon: '⚡' },
  { label: 'Repositorio GitHub', url: 'https://github.com', icon: '⬡' },
  { label: 'Documentación', url: '#', icon: '📄' },
];

export default function Home({ onNavigate, onLogout, notifBell, onSearch, theme }: Props) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);

  const togglePin = (id: string) => {
    setPinnedApps(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const sortedApps = [...APPS].sort((a, b) => {
    const pa = pinnedApps.includes(a.id) ? 0 : 1;
    const pb = pinnedApps.includes(b.id) ? 0 : 1;
    return pa - pb;
  });

  const now = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#050508',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: theme.text,
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #0f0f1c',
        padding: '0 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ color: theme.text, fontSize: 17, fontWeight: 900, letterSpacing: '3px' }}>BATALLA</span>
            <span style={{ color: theme.textMuted, fontSize: 17, fontWeight: 900, letterSpacing: '3px' }}>GROUP</span>
          </div>
          <div style={{ width: 1, height: 20, background: '#111120' }} />
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.35em' }}>PANEL DE ADMINISTRACIÓN</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ color: '#22c55e', fontSize: 10, letterSpacing: '0.2em', fontWeight: 600 }}>TODOS LOS SISTEMAS OK</span>
          </div>
          <div style={{ width: 1, height: 20, background: '#111120' }} />
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>{now}</span>
          <div style={{ width: 1, height: 20, background: '#111120' }} />
          <button
            onClick={onSearch}
            title="Buscar (Ctrl+K)"
            style={{ background: theme.surface, border: `1px solid `, borderRadius: 8, color: theme.textMuted, fontSize: 12, cursor: 'pointer', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}
          >🔍 <span style={{ fontSize: 10, letterSpacing: '0.1em' }}>CTRL+K</span></button>
          {notifBell}
          <div style={{ width: 1, height: 20, background: '#111120' }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '6px 14px',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, #e91e8c, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: theme.text,
            }}>RB</div>
            <div>
              <p style={{ margin: 0, color: theme.text, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>Ramses Batalla</p>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: 9, letterSpacing: '0.15em', lineHeight: 1.4 }}>ADMIN</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: theme.textMuted, fontSize: 11,
              cursor: 'pointer', letterSpacing: '0.15em',
              fontFamily: "'Inter', system-ui, sans-serif",
              padding: '8px 16px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,107,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#6868a8';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            SALIR ↗
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '40px 48px 64px', maxWidth: 1400, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{ color: theme.textDim, fontSize: 11, letterSpacing: '0.4em', margin: '0 0 6px' }}>━━ CENTRO DE CONTROL</p>
          <h1 style={{ color: theme.text, fontSize: 36, fontWeight: 900, margin: '0 0 4px', letterSpacing: '1px' }}>
            {greeting}, Ramses
          </h1>
          <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>
            Tienes <span style={{ color: '#e91e8c', fontWeight: 700 }}>6 módulos</span> activas y todos los sistemas operando con normalidad.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {KPI.map(k => (
            <div key={k.label} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '20px 22px',
              borderLeft: `3px solid ${k.color}`,
            }}>
              <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 8px', textTransform: 'uppercase' }}>{k.label}</p>
              <p style={{ color: theme.text, fontSize: 28, fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>{k.value}</p>
              <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.35em', margin: 0 }}>━━ APLICACIONES CONECTADAS</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 14, marginBottom: 32 }}>
          {sortedApps.map(app => (
            <div
              key={app.id}
              onClick={() => onNavigate(app.id)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
              style={{
                background: hoveredApp === app.id ? app.bgHover : 'rgba(255,255,255,0.018)',
                border: `1px solid ${hoveredApp === app.id ? app.borderHover : app.borderIdle}`,
                borderRadius: 16, padding: '26px 26px 22px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                transform: hoveredApp === app.id ? 'translateY(-3px)' : 'translateY(0)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: app.topLine, opacity: 0.5 }} />
              {pinnedApps.includes(app.id) && (
                <div style={{
                  position: 'absolute', top: 8, left: 12,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4, padding: '2px 7px',
                  color: theme.textMuted, fontSize: 8, letterSpacing: '0.3em', fontWeight: 700,
                }}>FIJADA</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: app.accent, border: `1px solid ${app.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{app.icon}</div>
                  <div>
                    <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 900, margin: '0 0 4px', letterSpacing: '0.5px' }}>{app.name}</h3>
                    <p style={{ color: theme.textMuted, fontSize: 11, margin: 0, lineHeight: 1.4 }}>{app.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); togglePin(app.id); }}
                      title={pinnedApps.includes(app.id) ? 'Desfijar' : 'Fijar arriba'}
                      style={{
                        background: pinnedApps.includes(app.id) ? `${app.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${pinnedApps.includes(app.id) ? app.color + '60' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 7, width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', padding: 0,
                        fontSize: 13,
                        color: pinnedApps.includes(app.id) ? app.color : '#4a4a78',
                      }}
                    >
                      {pinnedApps.includes(app.id) ? '📌' : '📍'}
                    </button>
                    <span style={{ color: app.color, fontSize: 16, opacity: 0.7 }}>→</span>
                  </div>
                  <span style={{
                    background: `${app.statusColor}18`, border: `1px solid ${app.statusColor}40`,
                    borderRadius: 6, padding: '2px 8px',
                    color: app.statusColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                  }}>{app.status}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {app.stats.map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 10, padding: '11px 12px',
                  }}>
                    <p style={{ color: theme.textMuted, fontSize: 9, letterSpacing: '0.25em', margin: '0 0 6px', textTransform: 'uppercase' }}>{s.label}</p>
                    <p style={{ color: '#c0c0d8', fontSize: 18, fontWeight: 900, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ color: '#6a6aaa', fontSize: 10, letterSpacing: '0.3em', margin: 0 }}>━━ ACTIVIDAD RECIENTE</p>
                <span style={{ color: '#5050a0', fontSize: 10 }}>Ver todo →</span>
              </div>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '12px 0',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: a.type === 'success' ? '#22c55e' : '#3b82f6',
                    boxShadow: a.type === 'success' ? '0 0 6px #22c55e66' : '0 0 6px #3b82f666',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#a0a0c8', fontSize: 12, margin: '0 0 2px' }}>{a.msg}</p>
                    <p style={{ color: '#4a4a80', fontSize: 10, margin: 0 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 26px' }}>
              <p style={{ color: '#6a6aaa', fontSize: 10, letterSpacing: '0.3em', margin: '0 0 20px' }}>━━ ESTADO DEL SISTEMA</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SYSTEM.map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 10, padding: '12px 16px',
                  }}>
                    <span style={{ color: '#9090b8', fontSize: 12 }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
                      <span style={{ color: '#22c55e', fontSize: 10 }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 22px' }}>
              <p style={{ color: '#6a6aaa', fontSize: 10, letterSpacing: '0.3em', margin: '0 0 18px' }}>━━ ACCESO RÁPIDO</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICKLINKS.map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                    onMouseEnter={() => setHoveredLink(l.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: hoveredLink === l.label ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10, padding: '11px 14px',
                      textDecoration: 'none', transition: 'all 0.15s', cursor: 'pointer',
                    }}>
                    <span style={{ fontSize: 14 }}>{l.icon}</span>
                    <span style={{ color: hoveredLink === l.label ? '#d0d0f0' : '#8080b8', fontSize: 12, flex: 1 }}>{l.label}</span>
                    <span style={{ color: '#5050a0', fontSize: 10 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px' }}>
              <p style={{ color: '#6a6aaa', fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ BUILD INFO</p>
              {[
                { label: 'Versión', value: 'v1.4.0' },
                { label: 'Branch', value: 'main' },
                { label: 'Framework', value: 'React + Vite' },
                { label: 'Deploy', value: 'Vercel' },
                { label: 'DB', value: 'Supabase' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#6868a8', fontSize: 11 }}>{r.label}</span>
                  <span style={{ color: '#9090cc', fontSize: 11, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ color: '#f97316', fontSize: 10, letterSpacing: '0.25em', margin: '0 0 8px' }}>━━ NOTA</p>
              <p style={{ color: '#c88848', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Ya Voy! está en desarrollo activo. Conecta las 3 sub-apps para activar métricas reales.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        position: 'relative', zIndex: 1, borderTop: '1px solid #0a0a14',
        padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#3a3a5c', fontSize: 10, letterSpacing: '0.2em' }}>© 2026 BATALLAGROUP — TODOS LOS DERECHOS RESERVADOS</span>
        <span style={{ color: '#3a3a5c', fontSize: 10, letterSpacing: '0.2em' }}>V 1.4.0 · PROD</span>
      </footer>
    </div>
  );
}
