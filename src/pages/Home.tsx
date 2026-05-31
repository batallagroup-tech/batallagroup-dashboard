import { useState, useEffect } from 'react';
import type { Theme } from '../App';
import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  theme: Theme;
  notifBell?: React.ReactNode;
  onSearch?: () => void;
  lang: 'es' | 'en';
}

const T = {
  es: {
    panel: 'PANEL DE ADMINISTRACIÓN',
    greetMorning: 'Buenos días', greetAfternoon: 'Buenas tardes', greetEvening: 'Buenas noches',
    subtitle: 'Aquí está el resumen general de BatallaGroup al día de hoy.',
    logout: 'Salir',
    apps: 'APLICACIONES',
    kpiApps: 'Apps en producción', kpiDev: 'Apps en desarrollo', kpiUptime: 'Uptime global',
    kpiUsers: 'Usuarios totales', kpiIncidents: 'Incidentes activos', kpiDeploys: 'Deploys este mes',
    subUptime: 'Últimos 30 días', subUsers: 'Entre todas las apps', subIncidents: 'BarrioAlerta', subDeploys: 'Vercel · main',
    quickAccess: 'ACCESO RÁPIDO', systemStatus: 'ESTADO DEL SISTEMA',
    operational: 'Operacional', degraded: 'Degradado',
    recentActivity: 'ACTIVIDAD RECIENTE',
    act1: 'Deploy exitoso — batallagroup-dashboard', act2: 'Push a main — fix: Home reescrito',
    act3: 'Ya Voy! — 9 módulos activos', act4: 'VORDashboard v1.4.0 actualizado',
    act5: 'BarrioAlerta conectado a Supabase Realtime',
    companyMetrics: 'MÉTRICAS DE LA EMPRESA',
    totalApps: 'Productos totales', liveApps: 'En producción', devApps: 'En desarrollo',
    techStack: 'STACK TECNOLÓGICO',
    analytics: 'Analytics', versions: 'Versiones',
    vorDesc: 'Gestión de retos, verdades y contenido del juego',
    baDesc: 'Monitoreo de incidentes y reportes de la comunidad',
    yvDesc: 'Plataforma de reparto — cliente, restaurante y repartidor',
    live: 'LIVE', dev: 'DEV',
    challenges: 'Retos', modes: 'Modos', version: 'Versión',
    incidents: 'Incidentes', users: 'Usuarios', reports: 'Reportes',
    subapps: 'Sub-apps', orders: 'Pedidos', status: 'Estado',
    footer: '© 2026 BatallaGroup — Todos los derechos reservados',
  },
  en: {
    panel: 'ADMINISTRATION PANEL',
    greetMorning: 'Good morning', greetAfternoon: 'Good afternoon', greetEvening: 'Good evening',
    subtitle: "Here's BatallaGroup's general summary for today.",
    logout: 'Sign out',
    apps: 'APPLICATIONS',
    kpiApps: 'Apps in production', kpiDev: 'Apps in development', kpiUptime: 'Global uptime',
    kpiUsers: 'Total users', kpiIncidents: 'Active incidents', kpiDeploys: 'Deploys this month',
    subUptime: 'Last 30 days', subUsers: 'Across all apps', subIncidents: 'BarrioAlerta', subDeploys: 'Vercel · main',
    quickAccess: 'QUICK ACCESS', systemStatus: 'SYSTEM STATUS',
    operational: 'Operational', degraded: 'Degraded',
    recentActivity: 'RECENT ACTIVITY',
    act1: 'Successful deploy — batallagroup-dashboard', act2: 'Push to main — fix: Home rewritten',
    act3: 'Ya Voy! — 9 active modules', act4: 'VORDashboard v1.4.0 updated',
    act5: 'BarrioAlerta connected to Supabase Realtime',
    companyMetrics: 'COMPANY METRICS',
    totalApps: 'Total products', liveApps: 'In production', devApps: 'In development',
    techStack: 'TECH STACK',
    analytics: 'Analytics', versions: 'Versions',
    vorDesc: 'Manage challenges, truths and game content',
    baDesc: 'Monitor community incidents and reports',
    yvDesc: 'Delivery platform — customer, restaurant and driver',
    live: 'LIVE', dev: 'DEV',
    challenges: 'Challenges', modes: 'Modes', version: 'Version',
    incidents: 'Incidents', users: 'Users', reports: 'Reports',
    subapps: 'Sub-apps', orders: 'Orders', status: 'Status',
    footer: '© 2026 BatallaGroup — All rights reserved',
  },
};

const SYSTEM = [
  { label: { es: 'Vercel (Deploy)', en: 'Vercel (Deploy)' }, ok: true },
  { label: { es: 'Supabase (Base de datos)', en: 'Supabase (Database)' }, ok: true },
  { label: { es: 'Autenticación', en: 'Authentication' }, ok: true },
  { label: { es: 'CDN / Edge', en: 'CDN / Edge' }, ok: true },
  { label: { es: 'Neon PostgreSQL', en: 'Neon PostgreSQL' }, ok: true },
  { label: { es: 'API Ya Voy', en: 'Ya Voy API' }, ok: true },
];

const STACK = [
  { name: 'React 19 + TypeScript', color: '#3b82f6' },
  { name: 'Vite 8', color: '#a855f7' },
  { name: 'Supabase', color: '#22c55e' },
  { name: 'Neon PostgreSQL', color: '#14b8a6' },
  { name: 'Vercel', color: '#ffffff' },
  { name: 'Capacitor (Android)', color: '#f97316' },
];

const ACTIVITY = [
  { type: 'success', time: { es: 'Hace 2 min', en: '2 min ago' } },
  { type: 'info',    time: { es: 'Hace 18 min', en: '18 min ago' } },
  { type: 'info',    time: { es: 'Hace 1 h', en: '1 h ago' } },
  { type: 'success', time: { es: 'Hace 3 h', en: '3 h ago' } },
  { type: 'success', time: { es: 'Ayer', en: 'Yesterday' } },
];

export default function Home({ onNavigate, onLogout, notifBell, onSearch, theme, lang }: Props) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const t = T[lang];

  const now = new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greetMorning : hour < 19 ? t.greetAfternoon : t.greetEvening;

  const APPS = [
    {
      id: 'vor' as Screen, name: 'VOR — Verdad o Reto', desc: t.vorDesc,
      icon: '🎮', color: '#e91e8c',
      borderIdle: 'rgba(233,30,140,0.15)', borderHover: 'rgba(233,30,140,0.45)', bgHover: 'rgba(233,30,140,0.05)',
      status: t.live, statusColor: '#22c55e',
      stats: [{ label: t.challenges, value: '2,216' }, { label: t.modes, value: '13' }, { label: t.version, value: '1.4.0' }],
    },
    {
      id: 'barrio' as Screen, name: 'BarrioAlerta', desc: t.baDesc,
      icon: '🚨', color: '#3b82f6',
      borderIdle: 'rgba(59,130,246,0.15)', borderHover: 'rgba(59,130,246,0.45)', bgHover: 'rgba(59,130,246,0.05)',
      status: t.live, statusColor: '#22c55e',
      stats: [{ label: t.incidents, value: '—' }, { label: t.users, value: '—' }, { label: t.reports, value: '—' }],
    },
    {
      id: 'yavoy' as Screen, name: 'Ya Voy!', desc: t.yvDesc,
      icon: '🛵', color: '#f97316',
      borderIdle: 'rgba(249,115,22,0.15)', borderHover: 'rgba(249,115,22,0.45)', bgHover: 'rgba(249,115,22,0.05)',
      status: t.dev, statusColor: '#f59e0b',
      stats: [{ label: t.subapps, value: '9' }, { label: t.orders, value: '—' }, { label: t.status, value: t.dev }],
    },
  ];

  const KPI = [
    { label: t.kpiApps,      value: '2',     sub: 'VOR · BarrioAlerta',  color: '#22c55e' },
    { label: t.kpiDev,       value: '1',     sub: 'Ya Voy!',              color: '#f59e0b' },
    { label: t.kpiUptime,    value: '99.8%', sub: t.subUptime,            color: '#3b82f6' },
    { label: t.kpiUsers,     value: '89+',   sub: t.subUsers,             color: '#8b5cf6' },
    { label: t.kpiIncidents, value: '—',     sub: t.subIncidents,         color: '#ef4444' },
    { label: t.kpiDeploys,   value: '12',    sub: t.subDeploys,           color: '#e91e8c' },
  ];

  const ACTIVITY_MSGS = [t.act1, t.act2, t.act3, t.act4, t.act5];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif", color: theme.text }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: theme.bg === '#050508' ? 'rgba(5,5,8,0.94)' : 'rgba(240,240,248,0.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${theme.border}`, padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ color: theme.text, fontSize: 15, fontWeight: 900, letterSpacing: '3px' }}>BATALLA</span>
            <span style={{ color: theme.textMuted, fontSize: 15, fontWeight: 900, letterSpacing: '3px' }}>GROUP</span>
          </div>
          <div style={{ width: 1, height: 16, background: theme.border }} />
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em' }}>{t.panel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onSearch} title="Ctrl+K" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, fontSize: 11, cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
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
          >{t.logout}</button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '36px 40px 60px', maxWidth: 1360, margin: '0 auto' }}>

        {/* GREETING */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 6px' }}>BATALLAGROUP · {now}</p>
          <h1 style={{ color: theme.text, fontSize: 30, fontWeight: 900, margin: '0 0 6px' }}>{greeting}, Ramses 👋</h1>
          <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>{t.subtitle}</p>
        </div>

        {/* KPIs — 6 tarjetas con info real de la empresa */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 28 }}>
          {KPI.map(k => (
            <div key={k.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px 18px', borderTop: `2px solid ${k.color}` }}>
              <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.2em', margin: '0 0 8px', textTransform: 'uppercase' as const, lineHeight: 1.3 }}>{k.label}</p>
              <p style={{ color: theme.text, fontSize: 24, fontWeight: 900, margin: '0 0 3px', lineHeight: 1 }}>{k.value}</p>
              <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* APPS */}
        <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.35em', margin: '0 0 12px' }}>{t.apps}</p>
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

        {/* FILA INFERIOR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

          {/* Actividad reciente */}
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 16px' }}>{t.recentActivity}</p>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: a.type === 'success' ? '#22c55e' : '#3b82f6', boxShadow: a.type === 'success' ? '0 0 5px #22c55e66' : '0 0 5px #3b82f666' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.textMuted, fontSize: 12, margin: '0 0 1px' }}>{ACTIVITY_MSGS[i]}</p>
                  <p style={{ color: theme.textDim, fontSize: 10, margin: 0 }}>{a.time[lang]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Estado del sistema */}
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 16px' }}>{t.systemStatus}</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 7 }}>
              {SYSTEM.map(s => (
                <div key={s.label.es} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${theme.border}`, borderRadius: 8 }}>
                  <span style={{ color: theme.textMuted, fontSize: 11 }}>{s.label[lang]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                    <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 600 }}>{t.operational}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acceso rápido + Stack */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 20px' }}>
              <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 12px' }}>{t.quickAccess}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => onNavigate('analytics' as Screen)} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  <span style={{ fontSize: 15 }}>📊</span><span style={{ color: '#3b82f6', fontSize: 11, fontWeight: 700 }}>{t.analytics}</span>
                </button>
                <button onClick={() => onNavigate('versions' as Screen)} style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  <span style={{ fontSize: 15 }}>📋</span><span style={{ color: '#8b5cf6', fontSize: 11, fontWeight: 700 }}>{t.versions}</span>
                </button>
                {[
                  { label: 'Vercel', icon: '▲', url: 'https://vercel.com/dashboard' },
                  { label: 'Supabase', icon: '⚡', url: 'https://supabase.com/dashboard' },
                  { label: 'GitHub', icon: '⬡', url: 'https://github.com' },
                  { label: 'Neon', icon: '🐘', url: 'https://console.neon.tech' },
                ].map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px', display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                    <span style={{ fontSize: 14 }}>{l.icon}</span>
                    <span style={{ color: theme.textMuted, fontSize: 11 }}>{l.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Stack tecnológico */}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ color: theme.textDim, fontSize: 9, letterSpacing: '0.3em', margin: '0 0 10px' }}>{t.techStack}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {STACK.map(s => (
                  <span key={s.name} style={{ background: `${s.color}12`, border: `1px solid ${s.color}28`, borderRadius: 20, padding: '3px 10px', color: s.color === '#ffffff' ? theme.textMuted : s.color, fontSize: 10, fontWeight: 600 }}>{s.name}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${theme.border}`, padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>{t.footer}</span>
        <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>V 1.4.0 · PROD</span>
      </footer>
    </div>
  );
}
