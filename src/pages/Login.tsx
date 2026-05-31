import { useState, useEffect, useRef } from 'react';
import type { Theme } from '../App';

interface Props {
  onLogin: () => void;
  theme: Theme;
  dark: boolean;
  onThemeToggle: () => void;
  lang: 'es' | 'en';
  onLangToggle: () => void;
}

const T = {
  es: {
    private: 'SISTEMA PRIVADO',
    restricted: 'acceso restringido',
    admin: 'Panel de administracion',
    email: 'CORREO ELECTRONICO',
    password: 'CONTRASENA',
    emailPlaceholder: 'usuario@batallagroup.com',
    enter: 'ENTRAR',
    checking: 'VERIFICANDO...',
    error: 'Credenciales incorrectas.',
    footer: '2026 BatallaGroup. Acceso restringido.',
  },
  en: {
    private: 'PRIVATE SYSTEM',
    restricted: 'restricted access',
    admin: 'Administration panel',
    email: 'EMAIL ADDRESS',
    password: 'PASSWORD',
    emailPlaceholder: 'user@batallagroup.com',
    enter: 'SIGN IN',
    checking: 'VERIFYING...',
    error: 'Incorrect credentials.',
    footer: '2026 BatallaGroup. Restricted access.',
  },
};

const IDLE_MS = 3 * 60 * 1000;

function Screensaver({ onWake }: { onWake: () => void }) {
  const [pos, setPos] = useState({ x: 30, y: 40 });
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: 30, y: 40 });
  const velRef = useRef({ x: 0.4, y: 0.3 });
  useEffect(() => {
    const W = window.innerWidth; const H = window.innerHeight;
    const BW = 320; const BH = 80;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      let { x, y } = posRef.current;
      let { x: dx, y: dy } = velRef.current;
      x += dx * dt * 0.05; y += dy * dt * 0.05;
      if (x <= 0 || x >= W - BW) { dx = -dx; x = Math.max(0, Math.min(x, W - BW)); }
      if (y <= 0 || y >= H - BH) { dy = -dy; y = Math.max(0, Math.min(y, H - BH)); }
      posRef.current = { x, y }; velRef.current = { x: dx, y: dy };
      setPos({ x, y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return (
    <div onClick={onWake} tabIndex={0} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000', cursor: 'none' }}>
      <div style={{ position: 'absolute', left: pos.x, top: pos.y, userSelect: 'none', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '5px', fontFamily: "'Inter', system-ui, sans-serif", opacity: 0.9 }}>BATALLA</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 28, fontWeight: 900, letterSpacing: '5px', fontFamily: "'Inter', system-ui, sans-serif" }}>GROUP</span>
        </div>
        <div style={{ width: 40, height: 2, background: '#e91e8c', marginTop: 6, borderRadius: 1 }} />
      </div>
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.15)', fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.2em' }}>
        TOCA PARA CONTINUAR
      </div>
    </div>
  );
}

export default function Login({ onLogin, theme, dark, onThemeToggle, lang, onLangToggle }: Props) {
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);

  const t = T[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idle, setIdle] = useState(false);
  const [isFS, setIsFS] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  useEffect(() => {
    const reset = () => {
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const toggleFS = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const login = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      if (email === 'batallagroup@gmail.com' && password === '1905batallagroup06') {
        setError(''); onLogin();
      } else {
        setError(t.error); setLoading(false);
      }
    }, 400);
  };

  const textColor = dark ? '#eeeeff' : '#0a0a14';
  const mutedColor = dark ? '#7878a8' : '#3a3a6a';
  const dimColor = dark ? '#4a4a80' : '#6060a0';

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: 10, color: textColor, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const floatBtn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9,
    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
    fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: mutedColor, fontFamily: 'inherit', fontWeight: 700, fontSize: 11,
    transition: 'all 0.2s',
  };

  return (
    <>
      {idle && <Screensaver onWake={() => setIdle(false)} />}

      {/* Floating controls */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', gap: 6 }}>
        <button onClick={onLangToggle} style={floatBtn}>{lang === 'es' ? 'EN' : 'ES'}</button>
        <button onClick={onThemeToggle} style={floatBtn}>{dark ? '\u2600' : '\uD83C\uDF19'}</button>
        <button onClick={toggleFS} style={{ ...floatBtn, color: isFS ? '#3b82f6' : mutedColor }}>{'\u26F6'}</button>
      </div>

      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

        {/* Left - branding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'}` }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(128,128,128,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.4em', color: mutedColor, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 4, padding: '5px 14px', marginBottom: 32 }}>
                {t.private}
              </div>
              <h1 style={{ color: textColor, fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: '4px', lineHeight: 1.1 }}>BATALLA</h1>
              <h1 style={{ color: textColor, fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: '4px', lineHeight: 1.1, opacity: 0.25 }}>GROUP</h1>
            </div>
            <div style={{ borderLeft: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, paddingLeft: 20 }}>
              <p style={{ color: mutedColor, fontSize: 12, margin: 0, lineHeight: 1.8 }}>{t.admin}<br />{t.restricted}</p>
            </div>
          </div>
        </div>

        {/* Right - form */}
        <div style={{ width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px', background: dark ? '#0a0a14' : '#e8e8f0' }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ color: textColor, fontSize: 22, fontWeight: 900, margin: '0 0 8px', letterSpacing: '1px' }}>
              {lang === 'es' ? 'Acceder' : 'Sign in'}
            </h2>
            <p style={{ color: mutedColor, fontSize: 12, margin: 0 }}>
              {lang === 'es' ? 'Introduce tus credenciales' : 'Enter your credentials'}
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ color: mutedColor, fontSize: 10, letterSpacing: '0.25em', display: 'block', marginBottom: 8 }}>{t.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
              placeholder={t.emailPlaceholder} style={inp}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'} />
          </div>

          <div style={{ marginBottom: 28, position: 'relative' }}>
            <label style={{ color: mutedColor, fontSize: 10, letterSpacing: '0.25em', display: 'block', marginBottom: 8 }}>{t.password}</label>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••••••" style={{ ...inp, paddingRight: 44 }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 36, background: 'none', border: 'none', color: mutedColor, cursor: 'pointer', padding: 2 }}>
              {showPass ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 12, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <button onClick={login} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)') : textColor, border: 'none', borderRadius: 10, color: loading ? dimColor : theme.bg, fontWeight: 900, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {loading ? t.checking : t.enter}
          </button>

          <p style={{ color: dimColor, fontSize: 11, marginTop: 28, textAlign: 'center', letterSpacing: '0.1em' }}>{t.footer}</p>
        </div>
      </div>
    </>
  );
}

