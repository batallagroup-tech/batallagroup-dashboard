import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const APPS = [
  { id: 'vor' as Screen, name: 'VOR — Verdad o Reto', desc: 'Gestión de retos, verdades y contenido del juego', icon: '🎮', color: '#e91e8c', stats: [{ label: 'Retos', value: '2,216' }, { label: 'Modos', value: '13' }, { label: 'Versión', value: '1.4.0' }] },
  { id: 'barrio' as Screen, name: 'BarrioAlerta', desc: 'Monitoreo de incidentes y reportes de la comunidad', icon: '🚨', color: '#f59e0b', stats: [{ label: 'Incidentes', value: '—' }, { label: 'Usuarios', value: '—' }, { label: 'Reportes', value: '—' }] },
];

export default function Home({ onNavigate, onLogout }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'Courier New', monospace", padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
              BATALLA<span style={{ color: '#e91e8c' }}>GROUP</span>
            </h1>
            <p style={{ color: '#444', fontSize: 11, margin: '4px 0 0', letterSpacing: '0.2em' }}>
              DASHBOARD · {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid #222', borderRadius: 8, color: '#555', padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: "'Courier New', monospace" }}>
            Salir
          </button>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {APPS.map(app => (
            <div
              key={app.id}
              onClick={() => onNavigate(app.id)}
              style={{ background: '#111', border: `1px solid ${app.color}33`, borderRadius: 16, padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = app.color + '88')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = app.color + '33')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1a1a1a', border: `1px solid ${app.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {app.icon}
                  </div>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>{app.name}</h2>
                    <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>{app.desc}</p>
                  </div>
                </div>
                <span style={{ color: app.color, fontSize: 18 }}>→</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {app.stats.map(s => (
                  <div key={s.label} style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px' }}>
                    <p style={{ color: '#444', fontSize: 10, letterSpacing: '0.15em', margin: '0 0 4px' }}>{s.label.toUpperCase()}</p>
                    <p style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>{s.value}</p>
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
