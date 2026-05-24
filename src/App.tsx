import { useState, useEffect, useCallback } from 'react';
import type { Screen } from './types';
import Login from './pages/Login';
import Home from './pages/Home';
import VORDashboard from './pages/VORDashboard';
import BarrioAlerta from './pages/BarrioAlerta';
import YaVoy from './pages/YaVoy';
import Analytics from './pages/Analytics';
import Versions from './pages/Versions';

export interface Notification {
  id: string;
  type: 'sos' | 'report' | 'deploy' | 'info';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

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

function FullscreenButton({ theme }: { theme: Theme }) {
  const [isFS, setIsFS] = useState(false);
  useEffect(() => {
    const h = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  const toggle = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };
  return (
    <button onClick={toggle} title={isFS ? 'Salir pantalla completa' : 'Pantalla completa'}
      style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, width: 38, height: 38, borderRadius: 10, background: theme.bg2, border: `1px solid ${theme.border}`, color: isFS ? '#3b82f6' : theme.textDim, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}>⛶</button>
  );
}

function ThemeButton({ dark, onToggle, theme }: { dark: boolean; onToggle: () => void; theme: Theme }) {
  return (
    <button onClick={onToggle} title={dark ? 'Modo claro' : 'Modo oscuro'}
      style={{ position: 'fixed', bottom: 20, right: 68, zIndex: 9999, width: 38, height: 38, borderRadius: 10, background: theme.bg2, border: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}>{dark ? '☀' : '🌙'}</button>
  );
}

interface SearchResult { type: string; title: string; sub: string; screen?: Screen; }

function SearchOverlay({ onClose, onNavigate, theme }: { onClose: () => void; onNavigate: (s: Screen) => void; theme: Theme }) {
  const [q, setQ] = useState('');
  const STATIC: SearchResult[] = [
    { type: 'App', title: 'BarrioAlerta', sub: 'Panel de incidentes y reportes', screen: 'barrio' },
    { type: 'App', title: 'VOR — Verdad o Reto', sub: 'Gestión de retos y contenido', screen: 'vor' },
    { type: 'App', title: 'Ya Voy!', sub: 'App de reparto — solicitudes y restaurantes', screen: 'yavoy' },
    { type: 'Stats', title: 'Analytics', sub: 'Gráficas y métricas de tus apps', screen: 'analytics' },
    { type: 'Docs', title: 'Versiones & Changelog', sub: 'Historial de versiones de tus apps', screen: 'versions' },
  ];
  const results = q.trim().length < 2 ? STATIC : STATIC.filter(r => r.title.toLowerCase().includes(q.toLowerCase()) || r.sub.toLowerCase().includes(q.toLowerCase()));
  const TYPE_COLORS: Record<string, string> = { App: '#3b82f6', Stats: '#22c55e', Docs: '#f59e0b' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textDim, fontSize: 16 }}>🔍</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Escape' && onClose()} placeholder="Buscar pantalla, app, función…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 15 }} />
          <kbd style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '2px 7px', color: theme.textDim, fontSize: 11 }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => { if (r.screen) { onNavigate(r.screen); onClose(); } }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = theme.surface} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
              <span style={{ background: `${TYPE_COLORS[r.type] ?? '#64748b'}20`, border: `1px solid ${TYPE_COLORS[r.type] ?? '#64748b'}40`, borderRadius: 6, padding: '2px 8px', color: TYPE_COLORS[r.type] ?? '#64748b', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.type}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{r.title}</p>
                <p style={{ color: theme.textMuted, fontSize: 11, margin: 0 }}>{r.sub}</p>
              </div>
              <span style={{ color: theme.textDim, fontSize: 12 }}>→</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${theme.border}` }}>
          <span style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.2em' }}>CTRL+K para abrir · ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
}

const MOCK_NOTIFS = [
  { id: '1', type: 'sos', title: '🚨 SOS activo', body: 'Nuevo incidente SOS en Zacatlán', time: 'Hace 3 min', read: false },
  { id: '2', type: 'report', title: '🚩 Reporte de usuario', body: 'Incidente #a3f reportado por 3 usuarios', time: 'Hace 18 min', read: false },
  { id: '3', type: 'deploy', title: '✔ Deploy exitoso', body: 'batallagroup-dashboard → Vercel main', time: 'Hace 1h', read: true },
  { id: '4', type: 'info', title: 'ℹ Nuevo usuario', body: '5 usuarios nuevos en BarrioAlerta hoy', time: 'Hace 2h', read: true },
];
const NOTIF_COLORS: Record<string, string> = { sos: '#ef4444', report: '#f59e0b', deploy: '#22c55e', info: '#3b82f6' };

function NotifBell({ theme }: { theme: Theme }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: 16, color: theme.textMuted }}>
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', borderRadius: '50%', width: 17, height: 17, fontSize: 9, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.bg}` }}>{unread}</span>}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 999, background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 14, width: 320, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.text, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em' }}>NOTIFICACIONES</span>
              {unread > 0 && <button onClick={markAll} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, cursor: 'pointer' }}>Marcar todas leídas</button>}
            </div>
            {notifs.map(n => (
              <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, background: n.read ? 'transparent' : `${NOTIF_COLORS[n.type]}08`, cursor: 'pointer', borderLeft: n.read ? 'none' : `3px solid ${NOTIF_COLORS[n.type]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
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


function RealtimeIndicator() {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => setGlow(v => !v), 1200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 116, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 6,
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: 20, padding: "5px 12px", backdropFilter: "blur(8px)",
      cursor: "default", userSelect: "none",
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
        boxShadow: glow ? "0 0 10px 3px rgba(34,197,94,0.6)" : "0 0 4px rgba(34,197,94,0.3)",
        transition: "box-shadow 0.6s ease",
      }} />
      <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em" }}>
        TIEMPO REAL
      </span>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => sessionStorage.getItem('bg_auth') === '1' ? 'home' : 'login');
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = dark ? DARK : LIGHT;

  useEffect(() => { document.body.style.background = theme.bg; document.body.style.color = theme.text; }, [theme]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleLogin = () => { sessionStorage.setItem('bg_auth', '1'); setScreen('home'); };
  const handleLogout = () => { sessionStorage.removeItem('bg_auth'); setScreen('login'); };
  const handleNavigate = useCallback((s: Screen) => setScreen(s), []);
  const sharedProps = { theme, notifBell: <NotifBell theme={theme} />, onSearch: () => setSearchOpen(true) };

  return (
    <>
      {screen !== "login" && <RealtimeIndicator />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onNavigate={handleNavigate} theme={theme} />}
      <FullscreenButton theme={theme} />
      <ThemeButton dark={dark} onToggle={() => setDark(v => !v)} theme={theme} />
      {screen === 'login'     && <Login onLogin={handleLogin} theme={theme} />}
      {screen === 'home'      && <Home onNavigate={handleNavigate} onLogout={handleLogout} {...sharedProps} />}
      {screen === 'vor'       && <VORDashboard onBack={() => setScreen('home')} />}
      {screen === 'barrio'    && <BarrioAlerta onBack={() => setScreen('home')} />}
      {screen === 'yavoy'     && <YaVoy onBack={() => setScreen('home')} theme={theme} />}
      {screen === 'analytics' && <Analytics onBack={() => setScreen('home')} theme={theme} />}
      {screen === 'versions'  && <Versions onBack={() => setScreen('home')} theme={theme} />}
    </>
  );
}
