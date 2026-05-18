import { useState } from 'react';

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const login = () => {
    if (email === 'batallagroup@gmail.com' && password === '1905batallagroup06') {
      setError('');
      onLogin();
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d18 50%, #080810 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', monospace", padding: '1rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚡</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
            BATALLA<span style={{ color: '#e91e8c', textShadow: '0 0 20px rgba(233,30,140,0.5)' }}>GROUP</span>
          </h1>
          <p style={{ color: '#3a3a58', fontSize: 11, marginTop: 8, letterSpacing: '0.35em' }}>PANEL DE ADMINISTRACIÓN</p>
        </div>

        <div style={{
          background: 'rgba(14,14,26,0.95)',
          border: '1px solid #1e1e32',
          borderRadius: 18, padding: '2.2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#6868a0', fontSize: 10, letterSpacing: '0.25em', display: 'block', marginBottom: 8 }}>CORREO</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="batallagroup@gmail.com"
              style={{
                width: '100%', padding: '12px 16px',
                background: '#151525', border: '1px solid #2a2a42',
                borderRadius: 10, color: '#e8e8ff', fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 26, position: 'relative' }}>
            <label style={{ color: '#6868a0', fontSize: 10, letterSpacing: '0.25em', display: 'block', marginBottom: 8 }}>CONTRASEÑA</label>
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 44px 12px 16px',
                background: '#151525', border: '1px solid #2a2a42',
                borderRadius: 10, color: '#e8e8ff', fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 12, top: 34,
                background: 'none', border: 'none',
                color: '#555', cursor: 'pointer', fontSize: 16,
              }}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            onClick={login}
            style={{
              width: '100%', padding: 14,
              background: '#e91e8c', border: 'none',
              borderRadius: 10, color: '#fff',
              fontWeight: 900, fontSize: 15, cursor: 'pointer',
              letterSpacing: '0.1em',
              boxShadow: '0 0 24px rgba(233,30,140,0.35)',
            }}
          >
            ENTRAR →
          </button>
        </div>
      </div>
    </div>
  );
}
