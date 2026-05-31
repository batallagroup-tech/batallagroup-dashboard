import { useState, useEffect, useCallback } from 'react';
import type { Screen } from './types';
import Login from './pages/Login';
import Home from './pages/Home';
import VORDashboard from './pages/VORDashboard';
import BarrioAlerta from './pages/BarrioAlerta';
import YaVoy from './pages/YaVoy';
import Analytics from './pages/Analytics';
import Versions from './pages/Versions';

export interface Theme {
  bg: string; bg2: string; surface: string; border: string;
  text: string; textMuted: string; textDim: string;
}

export const DARK: Theme = {
  bg: '#050508', bg2: '#0a0a14', surface: 'rgba(255,255,255,0.02)',
  border: 'rgba(255,255,255,0.06)', text: '#eeeeff',
  textMuted: '#7878a8', textDim: '#4a4a80',
};

export const LIGHT: Theme = {
  bg: '#f0f0f8', bg2: '#e4e4f0', surface: 'rgba(0,0,0,0.03)',
  border: 'rgba(0,0,0,0.08)', text: '#12121e',
  textMuted: '#5858a0', textDim: '#8888c0',
};

function FloatingControls({ dark, onToggle, theme }: { dark: boolean; onToggle: () => void; theme: Theme }) {
  const [isFS, setIsFS] = useState(false);
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const h = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  useEffect(() => {
    const iv = setInterval(() => setGlow(v => !v), 1200);
    return () => clearInterval(iv);
  }, []);
  const toggleFS = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };
  const btn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9,
    background: theme.bg2, border: `1px solid ${theme.border}`,
    fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)', transition: 'all 0.2s',
    color: theme.textMuted,
  };
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 20, padding: '5px 10px', cursor: 'default', userSelect: 'none' as const }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: glow ? '0 0 8px 2px rgba(34,197,94,0.55)' : '0 0 3px rgba(34,197,94,0.3)', transition: 'box-shadow 0.6s ease' }} />
        <span style={{ color: '#22c55e', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em' }}>TIEMPO REAL</span>
      </div>
      <button onClick={onToggle} title={dark ? 'Modo claro' : 'Modo oscuro'} style={btn}>{dark ? '☀' : '🌙'}</button>
      <button onClick={toggleFS} title={isFS ? 'Salir pantalla completa' : 'Pantalla completa'} style={{ ...btn, color: isFS ? '#3b82f6' : theme.textDim }}>⛶</button>
    </div>
  );
}

function SearchOverlay({ onClose, onNavigate, theme }: { onClose: () => void; onNavigate: (s: Screen) => void; theme: Theme }) {
  const [q, setQ] = useState('');
  const STATIC = [
    { type: 'App', title: 'BarrioAlerta', sub: 'Panel de incidentes y reportes', screen: 'barrio' as Screen },
    { type: 'App', title: 'VOR — Verdad o Reto', sub: 'Gestión de retos y contenido', screen: 'vor' as Screen },
    { type: 'App', title: 'Ya Voy!', sub: 'App de reparto — solicitudes y restaurantes', screen: 'yavoy' as Screen },
    { type: 'Stats', title: 'Analytics', sub: 'Gráficas y métricas de tus apps', screen: 'analytics' as Screen },
    { type: 'Docs', title: 'Versiones & Changelog', sub: 'Historial de versiones de tus apps', screen: 'versions' as Screen },
  ];
  const results = q.trim().length < 2 ? STATIC : STATIC.filter(r =>
    r.title.toLowerCase().includes(q.toLowerCase()) || r.sub.toLowerCase().includes(q.toLowerCase())
  );
  const TC: Record<string, string> = { App: '#3b82f6', Stats: '#22c55e', Docs: '#f59e0b' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 16, width: '100%', maxWidth: 540, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textDim, fontSize: 15 }}>🔍</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Escape' && onClose()} placeholder="Buscar pantalla, app, función…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 14 }} />
          <kbd style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '2px 7px', color: theme.textDim, fontSize: 11 }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' as const }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => { onNavigate(r.screen); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = theme.surface}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
              <span style={{ background: `${TC[r.type] ?? '#64748b'}18`, border: `1px solid ${TC[r.type] ?? '#64748b'}35`, borderRadius: 5, padding: '2px 7px', color: TC[r.type] ?? '#64748b', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.type}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{r.title}</p>
                <p style={{ color: theme.textMuted, fontSize: 11, margin: 0 }}>{r.sub}</p>
              </div>
              <span style={{ color: theme.textDim, fontSize: 12 }}>→</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.15em' }}>CTRL+K · ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
}

const MOCK_NOTIFS = [
  { id: '1', type: 'sos',    title: '🚨 SOS activo',        body: 'Nuevo incidente SOS en Zacatlán',         time: 'Hace 3 min',  read: false },
  { id: '2', type: 'report', title: '🚩 Reporte de usuario', body: 'Incidente #a3f reportado por 3 usuarios', time: 'Hace 18 min', read: false },
  { id: '3', type: 'deploy', title: '✔ Deploy exitoso',      body: 'batallagroup-dashboard → Vercel main',   time: 'Hace 1h',     read: true  },
  { id: '4', type: 'info',   title: 'ℹ Nuevo usuario',       body: '5 usuarios nuevos en BarrioAlerta hoy',  time: 'Hace 2h',     read: true  },
];
const NC: Record<string, string> = { sos: '#ef4444', report: '#f59e0b', deploy: '#22c55e', info: '#3b82f6' };

function NotifBell({ theme }: { theme: Theme }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter(n => !n.read).length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: 15, color: theme.textMuted }}>
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', borderRadius: '50%', width: 15, height: 15, fontSize: 9, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.bg}` }}>{unread}</span>}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'absolute', top: 42, right: 0, zIndex: 999, background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 14, width: 300, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.text, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>NOTIFICACIONES</span>
              {unread > 0 && <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, cursor: 'pointer' }}>Marcar leídas</button>}
            </div>
            {notifs.map(n => (
              <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: n.read ? 'transparent' : `${NC[n.type]}08`, cursor: 'pointer', borderLeft: n.read ? 'none' : `3px solid ${NC[n.type]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: theme.text, fontSize: 12, fontWeight: n.read ? 400 : 700 }}>{n.title}</span>
                  <span style={{ color: theme.textDim, fontSize: 10 }}>{n.time}</span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: 11, margin: 0 }}>{n.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => sessionStorage.getItem('bg_auth') === '1' ? 'home' : 'login');
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = dark ? DARK : LIGHT;

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleLogin = () => { sessionStorage.setItem('bg_auth', '1'); setScreen('home'); };
  const handleLogout = () => { sessionStorage.removeItem('bg_auth'); setScreen('login'); };
  const handleNavigate = useCallback((s: Screen) => setScreen(s), []);
  const shared = { theme, notifBell: <NotifBell theme={theme} />, onSearch: () => setSearchOpen(true) };

  return (
    <>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onNavigate={handleNavigate} theme={theme} />}
      {screen !== 'login' && <FloatingControls dark={dark} onToggle={() => setDark(v => !v)} theme={theme} />}
      {screen === 'login'     && <Login onLogin={handleLogin} theme={theme} />}
      {screen === 'home'      && <Home onNavigate={handleNavigate} onLogout={handleLogout} {...shared} />}
      {screen === 'vor'       && <VORDashboard onBack={() => setScreen('home')} />}
      {screen === 'barrio'    && <BarrioAlerta onBack={() => setScreen('home')} />}
      {screen === 'yavoy'     && <YaVoy onBack={() => setScreen('home')} theme={theme} />}
      {screen === 'analytics' && <Analytics onBack={() => setScreen('home')} theme={theme} />}
      {screen === 'versions'  && <Versions onBack={() => setScreen('home')} theme={theme} />}
    </>
  );
}
