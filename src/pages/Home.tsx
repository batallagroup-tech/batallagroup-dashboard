import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
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
    borderIdle: 'rgba(249,115,22,0.18)',
    borderHover: 'rgba(249,115,22,0.5)',
    bgHover: 'rgba(249,115,22,0.06)',
    topLine: '#f97316',
    accent: '#1a0e00',
    stats: [
      { label: 'Apps', value: '3' },
      { label: 'Pedidos', value: '—' },
      { label: 'Estado', value: 'DEV' },
    ],
  },
];

export default function Home({ onNavigate, onLogout }: Props) {
  const now = new Date().toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#050508',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        borderBottom: '1px solid #0d0d16',
        padding: '0 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'stretch',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ color: '#ffffff', fontSize: 18, fontWeight: 900, letterSpacing: '3px' }}>BATALLA</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, fontWeight: 900, letterSpacing: '3px' }}>GROUP</span>
          </div>
          <div style={{ width: 1, height: 24, background: '#0f0f1a' }} />
          <span style={{ color: '#202030', fontSize: 10, letterSpacing: '0.3em' }}>PANEL DE ADMINISTRACIÓN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ color: '#181828', fontSize: 11, letterSpacing: '0.2em' }}>{now}</span>
          <div style={{ width: 1, height: 24, background: '#0f0f1a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: '#1a1a2a', fontSize: 10, letterSpacing: '0.2em' }}>ONLINE</span>
          </div>
          <div style={{ width: 1, height: 24, background: '#0f0f1a' }} />
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: 'none',
              color: '#252535', fontSize: 12,
              cursor: 'pointer', letterSpacing: '0.15em',
              fontFamily: "'Inter', system-ui, sans-serif",
              padding: '0 4px',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#aaaacc'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#252535'}
          >
            SALIR ↗
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '64px 48px 48px' }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.4em', color: '#1e1e2e', textTransform: 'uppercase' }}>
            ━━ Centro de control
          </span>
        </div>
        <h2 style={{ color: '#ffffff', fontSize: 42, fontWeight: 900, margin: '0 0 4px', letterSpacing: '2px', lineHeight: 1 }}>
          APLICACIONES
        </h2>
        <h2 style={{ color: 'rgba(255,255,255,0.15)', fontSize: 42, fontWeight: 900, margin: '0 0 48px', letterSpacing: '2px', lineHeight: 1 }}>
          CONECTADAS
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 16 }}>
          {APPS.map(app => (
            <div
              key={app.id}
              onClick={() => onNavigate(app.id)}
              style={{
                background: 'rgba(255,255,255,0.018)',
                border: `1px solid ${app.borderIdle}`,
                borderRadius: 16, padding: '28px 28px 24px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = app.borderHover;
                el.style.background = app.bgHover;
                el.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = app.borderIdle;
                el.style.background = 'rgba(255,255,255,0.018)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: app.topLine, opacity: 0.5 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: app.accent, border: `1px solid ${app.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {app.icon}
                  </div>
                  <div>
                    <h3 style={{ color: '#e0e0f0', fontSize: 17, fontWeight: 900, margin: '0 0 6px', letterSpacing: '0.5px' }}>{app.name}</h3>
                    <p style={{ color: '#252535', fontSize: 12, margin: 0 }}>{app.desc}</p>
                  </div>
                </div>
                <span style={{ color: app.color, fontSize: 18, opacity: 0.7 }}>→</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {app.stats.map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 10, padding: '12px',
                  }}>
                    <p style={{ color: '#1e1e2e', fontSize: 9, letterSpacing: '0.25em', margin: '0 0 7px', textTransform: 'uppercase' }}>{s.label}</p>
                    <p style={{ color: '#c0c0d8', fontSize: 20, fontWeight: 900, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: 'relative', zIndex: 1, borderTop: '1px solid #0d0d16',
        padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40,
      }}>
        <span style={{ color: '#141420', fontSize: 10, letterSpacing: '0.2em' }}>© 2026 BATALLAGROUP</span>
        <span style={{ color: '#141420', fontSize: 10, letterSpacing: '0.2em' }}>V 1.4.0</span>
      </div>
    </div>
  );
}