import { useState } from 'react';

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
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
      background: '#050508',
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
              color: '#ffffff',
              fontSize: 52,
              fontWeight: 900,
              margin: 0,
              letterSpacing: '4px',
              lineHeight: 1.1,
            }}>
              BATALLA
            </h1>
            <h1 style={{
              color: '#ffffff',
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
            <p style={{ color: '#7878a8', fontSize: 12, margin: 0, lineHeight: 1.8, letterSpacing: '0.05em' }}>
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
        background: '#07070c',
      }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px', letterSpacing: '1px' }}>
            Acceder
          </h2>
          <p style={{ color: '#6868a0', fontSize: 12, margin: 0, letterSpacing: '0.1em' }}>
            Introduce tus credenciales
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#6868a8', fontSize: 10, letterSpacing: '0.3em', display: 'block', marginBottom: 10 }}>
            CORREO ELECTRÓNICO
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="usuario@batallagroup.com"
            style={{
              width: '100%', padding: '14px 18px',
              background: '#0c0c14',
              border: '1px solid #1a1a28',
              borderRadius: 10, color: '#d0d0e0',
              fontSize: 14, boxSizing: 'border-box', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#3a3a58'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1a1a28'}
          />
        </div>

        <div style={{ marginBottom: 32, position: 'relative' }}>
          <label style={{ color: '#6868a8', fontSize: 10, letterSpacing: '0.3em', display: 'block', marginBottom: 10 }}>
            CONTRASEÑA
          </label>
          <input
            type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••••••"
            style={{
              width: '100%', padding: '14px 48px 14px 18px',
              background: '#0c0c14',
              border: '1px solid #1a1a28',
              borderRadius: 10, color: '#d0d0e0',
              fontSize: 14, boxSizing: 'border-box', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#3a3a58'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1a1a28'}
          />
          <button
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute', right: 14, top: 38,
              background: 'none', border: 'none',
              color: '#5858a0', cursor: 'pointer', fontSize: 15,
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
            background: loading ? '#0f0f1a' : '#ffffff',
            border: '1px solid ' + (loading ? '#1a1a28' : '#ffffff'),
            borderRadius: 10,
            color: loading ? '#303045' : '#050508',
            fontWeight: 900, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.25em',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = '#e0e0f0';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e0f0';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffffff';
            }
          }}
        >
          {loading ? 'VERIFICANDO...' : 'ENTRAR →'}
        </button>

        <p style={{ color: '#4a4a80', fontSize: 11, marginTop: 32, textAlign: 'center', letterSpacing: '0.1em' }}>
          © 2026 BatallaGroup. Acceso restringido.
        </p>
      </div>
    </div>
  );
}