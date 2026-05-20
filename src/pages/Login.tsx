import { useState, useEffect } from 'react';
import type { Theme } from '../App';

interface Props { onLogin: () => void; theme: Theme; }

export default function Login({ onLogin, theme }: Props) {
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);

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
        setError('Credenciales incorrectas.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        borderRight: '1px solid #0f0f18',
      }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.015) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 11, letterSpacing: '0.4em',
              color: '#ffffff',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, padding: '5px 14px',
              marginBottom: 32,
            }}>
              SISTEMA PRIVADO
            </div>
            <h1 style={{
              color: theme.text,
              fontSize: 52,
              fontWeight: 900,
              margin: 0,
              letterSpacing: '4px',
              lineHeight: 1.1,
            }}>
              BATALLA
            </h1>
            <h1 style={{
              color: theme.text,
              fontSize: 52,
              fontWeight: 900,
              margin: 0,
              letterSpacing: '4px',
              lineHeight: 1.1,
              opacity: 0.35,
            }}>
              GROUP
            </h1>
          </div>

          <div style={{ borderLeft: '2px solid rgba(255,255,255,0.12)', paddingLeft: 20 }}>
            <p style={{ color: theme.textMuted, fontSize: 12, margin: 0, lineHeight: 1.8, letterSpacing: '0.05em' }}>
              Panel de administración<br />
              acceso restringido
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        background: theme.bg2,
      }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: theme.text, fontSize: 22, fontWeight: 900, margin: '0 0 8px', letterSpacing: '1px' }}>
            Acceder
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 12, margin: 0, letterSpacing: '0.1em' }}>
            Introduce tus credenciales
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: theme.textMuted, fontSize: 10, letterSpacing: '0.3em', display: 'block', marginBottom: 10 }}>
            CORREO ELECTRÓNICO
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="usuario@batallagroup.com"
            style={{
              width: '100%', padding: '14px 18px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 10, color: theme.text,
              fontSize: 14, boxSizing: 'border-box', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = theme.textMuted}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = theme.border}
          />
        </div>

        <div style={{ marginBottom: 32, position: 'relative' }}>
          <label style={{ color: theme.textMuted, fontSize: 10, letterSpacing: '0.3em', display: 'block', marginBottom: 10 }}>
            CONTRASEÑA
          </label>
          <input
            type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••••••"
            style={{
              width: '100%', padding: '14px 48px 14px 18px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 10, color: theme.text,
              fontSize: 14, boxSizing: 'border-box', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = theme.textMuted}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = theme.border}
          />
          <button
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute', right: 14, top: 38,
              background: 'none', border: 'none',
              color: theme.textMuted, cursor: 'pointer', fontSize: 15,
            }}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '10px 16px',
            color: '#ef4444', fontSize: 12,
            marginBottom: 20, letterSpacing: '0.05em',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? theme.surface : theme.text,
            border: `1px solid ${loading ? theme.border : theme.text}`,
            borderRadius: 10,
            color: loading ? theme.textDim : theme.bg,
            fontWeight: 900, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.25em',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = theme.textMuted;
              (e.currentTarget as HTMLButtonElement).style.borderColor = theme.textMuted;
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = theme.text;
              (e.currentTarget as HTMLButtonElement).style.borderColor = theme.text;
            }
          }}
        >
          {loading ? 'VERIFICANDO...' : 'ENTRAR →'}
        </button>

        <p style={{ color: theme.textDim, fontSize: 11, marginTop: 32, textAlign: 'center', letterSpacing: '0.1em' }}>
          © 2026 BatallaGroup. Acceso restringido.
        </p>
      </div>
    </div>
  );
}