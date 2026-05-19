import { useState } from 'react';

const SUBAPPS = [
  { id: 'cliente', name: 'Ya Voy Cliente', icon: '📱', desc: 'App para pedir comida a domicilio' },
  { id: 'restaurante', name: 'Ya Voy Restaurante', icon: '🍽️', desc: 'Panel de gestión para restaurantes' },
  { id: 'repartidor', name: 'Ya Voy Repartidor', icon: '🛵', desc: 'App para repartidores en ruta' },
];

interface Props { onBack: () => void; }

export default function YaVoy({ onBack }: Props) {
  const [sub, setSub] = useState<string | null>(null);

  if (sub) {
    const app = SUBAPPS.find(a => a.id === sub)!;
    return (
      <div style={{ minHeight: '100vh', background: '#050508', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ background: '#0c0c14', borderBottom: '1px solid #1e1e30', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setSub(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#ccccee', padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: '#eeeeff', fontSize: 18, fontWeight: 900, margin: 0 }}>{app.icon} {app.name}</h1>
            <p style={{ color: '#5a5a80', fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>MÓDULO EN DESARROLLO</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px)', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{app.icon}</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#eeeeff', fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>{app.name}</h2>
            <p style={{ color: '#3a3a58', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{app.desc}<br />Esta sección está en desarrollo.</p>
          </div>
          <button onClick={() => setSub(null)} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: 10, color: '#fb923c', padding: '12px 28px', cursor: 'pointer', fontSize: 13, fontWeight: 700, marginTop: 8 }}>← Regresar a Ya Voy!</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#0c0c14', borderBottom: '1px solid #1e1e30', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#ccccee', padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: '#eeeeff', fontSize: 18, fontWeight: 900, margin: 0 }}>🛵 Ya Voy!</h1>
            <p style={{ color: '#5a5a80', fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>PLATAFORMA DE REPARTO</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '48px 40px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: '#4a4a80', fontSize: 11, letterSpacing: '0.35em', marginBottom: 8 }}>━━ APLICACIONES</p>
          <h2 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '1px' }}>Ya Voy!</h2>
          <p style={{ color: '#3a3a50', fontSize: 13, marginTop: 8 }}>Selecciona una aplicación para administrar</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {SUBAPPS.map(app => (
            <div key={app.id} onClick={() => setSub(app.id)} style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(249,115,22,0.45)'; el.style.background = 'rgba(249,115,22,0.08)'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(249,115,22,0.15)'; el.style.background = 'rgba(249,115,22,0.04)'; el.style.transform = 'translateY(0)'; }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: '#f97316', opacity: 0.4 }} />
              <div style={{ fontSize: 32, marginBottom: 16 }}>{app.icon}</div>
              <h3 style={{ color: '#eeeeff', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>{app.name}</h3>
              <p style={{ color: '#3a3a50', fontSize: 12, margin: '0 0 20px', lineHeight: 1.5 }}>{app.desc}</p>
              <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '4px 12px', color: '#fb923c', fontSize: 11, letterSpacing: '0.15em' }}>EN DESARROLLO</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}