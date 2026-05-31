import { useState, useEffect } from 'react';
import type { Theme } from '../App';

interface Props {
  onLogin: () => void;
  theme: Theme;
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

export default function Login({ onLogin, theme, lang, onLangToggle }: Props) {
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

  const login = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      if (email === 'batallagroup@gmail.com' && password === '1905batallagroup06') {
        setError('');
        onLogin();
      } else {
        setError(t.error);
        setLoading(false);
      }
    }, 400);
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: theme.surface, border: `1px solid ${theme.border}`,
    borderRadius: 10, color: theme.text, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const lbl: React.CSSProperties = {
    color: theme.textMuted, fontSize: 10, letterSpacing: '0.25em',
    display: 'block', marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden', position: 'relative' }}>

      {/* Lang toggle - top right */}
      <button onClick={onLangToggle} style={{ position: 'absolute', top: 20, right: 24, zIndex: 10, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '6px 14px', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
        {lang === 'es' ? 'EN' : 'ES'}
      </button>

      {/* Left panel - branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', borderRight: `1px solid ${theme.border}` }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(233,30,140,0.04) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.4em', color: theme.textMuted, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 4, padding: '5px 14px', marginBottom: 32 }}>
              {t.private}
            </div>
            <h1 style={{ color: theme.text, fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: '4px', lineHeight: 1.1 }}>BATALLA</h1>
            <h1 style={{ color: theme.text, fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: '4px', lineHeight: 1.1, opacity: 0.3 }}>GROUP</h1>
          </div>
          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 20 }}>
            <p style={{ color: theme.textMuted, fontSize: 12, margin: 0, lineHeight: 1.8, letterSpacing: '0.05em' }}>
              {t.admin}<br />{t.restricted}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px', background: theme.bg2 }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ color: theme.text, fontSize: 22, fontWeight: 900, margin: '0 0 8px', letterSpacing: '1px' }}>
            {lang === 'es' ? 'Acceder' : 'Sign in'}
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 12, margin: 0 }}>
            {lang === 'es' ? 'Introduce tus credenciales' : 'Enter your credentials'}
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>{t.email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder={t.emailPlaceholder} style={inp}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = theme.textMuted}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = theme.border} />
        </div>

        <div style={{ marginBottom: 28, position: 'relative' }}>
          <label style={lbl}>{t.password}</label>
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••••••" style={{ ...inp, paddingRight: 44 }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = theme.textMuted}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = theme.border} />
          <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 36, background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 14, padding: 2 }}>
            {showPass ? 'O' : '*'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 12, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <button onClick={login} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? theme.surface : theme.text, border: `1px solid ${loading ? theme.border : theme.text}`, borderRadius: 10, color: loading ? theme.textDim : theme.bg, fontWeight: 900, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          {loading ? t.checking : t.enter}
        </button>

        <p style={{ color: theme.textDim, fontSize: 11, marginTop: 28, textAlign: 'center', letterSpacing: '0.1em' }}>
          {t.footer}
        </p>
      </div>
    </div>
  );
}
