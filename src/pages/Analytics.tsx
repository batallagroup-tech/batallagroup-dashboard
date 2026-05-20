/**
 * Analytics.tsx — Gráficas y métricas de todas tus apps
 * Sin Supabase por ahora — datos mock realistas
 */

import { useState } from 'react';
import type { Theme } from '../App';

interface Props { onBack: () => void; theme: Theme; }

// ─── Mock data ────────────────────────────────────────────────────────────────

const WEEKS = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];

const BARRIO_USERS   = [12, 19, 28, 35, 41, 58, 72, 89];
const BARRIO_INC     = [34, 56, 48, 71, 65, 88, 102, 94];
const BARRIO_SOS     = [2, 4, 3, 6, 5, 8, 7, 11];

const VOR_SESSIONS   = [210, 345, 289, 410, 502, 480, 620, 711];
const VOR_RETOS      = [2100, 2120, 2150, 2180, 2190, 2200, 2210, 2216];

const CITIES = [
  { name: 'Zacatlán', count: 43, color: '#3b82f6' },
  { name: 'Puebla', count: 31, color: '#8b5cf6' },
  { name: 'CDMX', count: 28, color: '#e91e8c' },
  { name: 'Monterrey', count: 19, color: '#f97316' },
  { name: 'Guadalajara', count: 14, color: '#22c55e' },
  { name: 'Otros', count: 22, color: '#64748b' },
];

const INC_CATS = [
  { name: 'Crimen', count: 38, color: '#ef4444' },
  { name: 'Siniestro', count: 22, color: '#f59e0b' },
  { name: 'Aviso', count: 18, color: '#94a3b8' },
  { name: 'Búsqueda', count: 9, color: '#3b82f6' },
  { name: 'Incendio', count: 7, color: '#ea580c' },
  { name: 'Otros', count: 6, color: '#64748b' },
];

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data, labels, color, unit = '' }: {
  data: number[]; labels: string[]; color: string; unit?: string;
}) {
  const max = Math.max(...data);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <div style={{ background: 'rgba(0,0,0,0.8)', border: `1px solid ${color}40`, borderRadius: 6, padding: '3px 7px', fontSize: 10, color: '#fff', whiteSpace: 'nowrap' as const, marginBottom: 2 }}>
              {v}{unit}
            </div>
          )}
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            background: hovered === i ? color : `${color}80`,
            height: `${Math.round((v / max) * 100)}%`,
            minHeight: 4, transition: 'all 0.2s',
          }} />
          <span style={{ fontSize: 9, color: '#4a4a6a', letterSpacing: '0.1em' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────────────

function LineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 300; const H = 80;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 10) - 5,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80 }}>
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />)}
    </svg>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────

function Donut({ items }: { items: { name: string; count: number; color: string }[] }) {
  const total = items.reduce((a, x) => a + x.count, 0);
  let angle = -90;
  const R = 60; const CX = 80; const CY = 80;
  const slices = items.map(item => {
    const pct = item.count / total;
    const startAngle = angle;
    angle += pct * 360;
    const endAngle = angle;
    const start = polarToXY(CX, CY, R, startAngle);
    const end = polarToXY(CX, CY, R, endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { ...item, path: `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`, pct };
  });

  function polarToXY(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg viewBox="0 0 160 160" style={{ width: 120, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={CX} cy={CY} r={38} fill="#080810" />
        <text x={CX} y={CY - 4} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="#4a4a6a" fontSize="8">TOTAL</text>
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
              <span style={{ color: '#9090b8', fontSize: 11 }}>{s.name}</span>
            </div>
            <span style={{ color: s.color, fontSize: 11, fontWeight: 700 }}>{s.count} ({Math.round(s.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Analytics({ onBack, theme }: Props) {
  const [tab, setTab] = useState<'barrio' | 'vor' | 'general'>('barrio');

  const card = {
    background: theme.surface, border: `1px solid ${theme.border}`,
    borderRadius: 14, padding: '20px 22px',
  };

  const KPIs = tab === 'barrio' ? [
    { label: 'Usuarios totales', value: '89', delta: '+23%', color: '#3b82f6' },
    { label: 'Incidentes (8 sem)', value: '558', delta: '+18%', color: '#ef4444' },
    { label: 'SOS disparados', value: '46', delta: '+37%', color: '#f59e0b' },
    { label: 'Ciudades activas', value: '5+', delta: 'Nuevo', color: '#22c55e' },
  ] : tab === 'vor' ? [
    { label: 'Sesiones (8 sem)', value: '3,567', delta: '+41%', color: '#e91e8c' },
    { label: 'Retos totales', value: '2,216', delta: '+116', color: '#8b5cf6' },
    { label: 'Modos activos', value: '13', delta: 'Estable', color: '#3b82f6' },
    { label: 'Versión', value: 'v1.4.0', delta: 'Latest', color: '#22c55e' },
  ] : [
    { label: 'Apps en prod', value: '2', delta: 'LIVE', color: '#22c55e' },
    { label: 'Apps en dev', value: '1', delta: 'DEV', color: '#f59e0b' },
    { label: 'Total usuarios', value: '89+', delta: 'Creciendo', color: '#3b82f6' },
    { label: 'Uptime', value: '99.8%', delta: '30 días', color: '#8b5cf6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif", color: theme.text }}>
      {/* Header */}
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>📊 Analytics</h1>
            <p style={{ color: theme.textDim, fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>MÉTRICAS Y CRECIMIENTO · DATOS MOCK</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['barrio', 'vor', 'general'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? '#3b82f620' : theme.surface,
              border: `1px solid ${tab === t ? '#3b82f640' : theme.border}`,
              borderRadius: 8, color: tab === t ? '#3b82f6' : theme.textMuted,
              padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}>
              {t === 'barrio' ? '🚨 BarrioAlerta' : t === 'vor' ? '🎮 VOR' : '◉ General'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: 1300, margin: '0 auto' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {KPIs.map(k => (
            <div key={k.label} style={{ ...card, borderLeft: `3px solid ${k.color}` }}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px' }}>{k.label.toUpperCase()}</p>
              <p style={{ color: theme.text, fontSize: 28, fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>{k.value}</p>
              <span style={{ background: `${k.color}20`, border: `1px solid ${k.color}40`, borderRadius: 5, padding: '1px 7px', color: k.color, fontSize: 10, fontWeight: 700 }}>{k.delta}</span>
            </div>
          ))}
        </div>

        {tab === 'barrio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ CRECIMIENTO DE USUARIOS (8 semanas)</p>
              <LineChart data={BARRIO_USERS} color="#3b82f6" />
              <BarChart data={BARRIO_USERS} labels={WEEKS} color="#3b82f6" />
            </div>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ INCIDENTES POR SEMANA</p>
              <LineChart data={BARRIO_INC} color="#ef4444" />
              <BarChart data={BARRIO_INC} labels={WEEKS} color="#ef4444" />
            </div>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ SOS POR SEMANA</p>
              <BarChart data={BARRIO_SOS} labels={WEEKS} color="#f59e0b" />
            </div>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ CATEGORÍAS DE INCIDENTES</p>
              <Donut items={INC_CATS} />
            </div>
            <div style={{ ...card, gridColumn: '1 / -1' }}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ CIUDADES MÁS ACTIVAS</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
                {CITIES.map((c, i) => {
                  const max = Math.max(...CITIES.map(x => x.count));
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ color: c.color, fontSize: 10, fontWeight: 700 }}>{c.count}</span>
                      <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: c.color, height: `${Math.round((c.count / max) * 80)}%`, minHeight: 4 }} />
                      <span style={{ color: theme.textDim, fontSize: 9 }}>{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'vor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ SESIONES POR SEMANA</p>
              <LineChart data={VOR_SESSIONS} color="#e91e8c" />
              <BarChart data={VOR_SESSIONS} labels={WEEKS} color="#e91e8c" />
            </div>
            <div style={card}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ RETOS ACUMULADOS</p>
              <LineChart data={VOR_RETOS} color="#8b5cf6" />
              <BarChart data={VOR_RETOS} labels={WEEKS} color="#8b5cf6" unit=" retos" />
            </div>
          </div>
        )}

        {tab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'BarrioAlerta', color: '#3b82f6', status: 'LIVE', users: 89, version: 'v1.2.0' },
              { label: 'VOR', color: '#e91e8c', status: 'LIVE', users: 'N/A', version: 'v1.4.0' },
              { label: 'Ya Voy!', color: '#f97316', status: 'DEV', users: '—', version: 'v0.1.0' },
            ].map(app => (
              <div key={app.label} style={{ ...card, borderTop: `3px solid ${app.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ color: theme.text, fontSize: 15, fontWeight: 900 }}>{app.label}</span>
                  <span style={{ background: app.status === 'LIVE' ? '#22c55e20' : '#f59e0b20', border: `1px solid ${app.status === 'LIVE' ? '#22c55e40' : '#f59e0b40'}`, borderRadius: 6, padding: '2px 8px', color: app.status === 'LIVE' ? '#22c55e' : '#f59e0b', fontSize: 10, fontWeight: 700 }}>{app.status}</span>
                </div>
                {[
                  { label: 'Usuarios', value: String(app.users) },
                  { label: 'Versión', value: app.version },
                  { label: 'Plataforma', value: 'Android + Web' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ color: theme.textMuted, fontSize: 12 }}>{r.label}</span>
                    <span style={{ color: theme.text, fontSize: 12, fontWeight: 700 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ ...card, marginTop: 14, textAlign: 'center' as const }}>
          <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>
            📌 Los datos actuales son ilustrativos. Cuando conectes Supabase, estas gráficas mostrarán métricas reales en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
