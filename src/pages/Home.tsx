import type { Screen } from '../App';

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
    glow: 'rgba(233,30,140,0.15)',
    borderHover: 'rgba(233,30,140,0.6)',
    accent: '#1a0010',
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
    glow: 'rgba(59,130,246,0.15)',
    borderHover: 'rgba(59,130,246,0.6)',
    accent: '#0a1020',
    stats: [
      { label: 'Incidentes', value: '—' },
      { label: 'Usuarios', value: '—' },
      { label: 'Reportes', value: '—' },
    ],
  },
];

export default function Home({ onNavigate, onLogout }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d18 50%, #080810 100%)',
      fontFamily: "'Courier New', monospace",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid effect */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(10,10,20,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            color: '#fff', fontSize: 26, fontWeight: 900, margin: 0,
            letterSpacing: '-1px', textShadow: '0 0 30px rgba(255,255,255,0.1)',
          }}>
            BATALLA<span style={{ color: '#e91e8c', textShadow: '0 0 20px rgba(233,30,140,0.5)' }}>GROUP</span>
          </h1>
          <p style={{ color: '#4a4a6a', fontSize: 11, margin: '4px 0 0', letterSpacing: '0.3em' }}>
            PANEL DE ADMINISTRACIÓN · {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
          }} />
          <span style={{ color: '#4a4a6a', fontSize: 11, letterSpacing: '0.15em' }}>SISTEMA ACTIVO</span>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: '#888',
              padding: '8px 20px', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Courier New', monospace",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ccc';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888';
            }}
          >
            Salir ↗
          </button>
        </div>
      </div>

      {/* Main content — full width, no container cap */}
      <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: '#3a3a5a', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 8 }}>
            ● APLICACIONES CONECTADAS
          </p>
          <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
            Centro de control
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
          {APPS.map(app => (
            <div
              key={app.id}
              onClick={() => onNavigate(app.id)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 20, padding: '28px 28px 24px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = app.borderHover;
                el.style.background = app.glow;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = `0 8px 40px ${app.glow}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'rgba(255,255,255,0.07)';
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${app.color}, transparent)`,
                opacity: 0.5,
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: 16,
                    background: app.accent,
                    border: `1px solid ${app.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: `0 0 20px ${app.color}20`,
                  }}>
                    {app.icon}
                  </div>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{app.name}</h2>
                    <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0', lineHeight: 1.4 }}>{app.desc}</p>
                  </div>
                </div>
                <div style={{
                  color: app.color, fontSize: 22, paddingTop: 4,
                  textShadow: `0 0 12px ${app.color}`,
                }}>→</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {app.stats.map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '14px 12px',
                  }}>
                    <p style={{ color: '#3a3a5a', fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px', textTransform: 'uppercase' }}>{s.label}</p>
                    <p style={{ color: '#e0e0ff', fontSize: 22, fontWeight: 900, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
