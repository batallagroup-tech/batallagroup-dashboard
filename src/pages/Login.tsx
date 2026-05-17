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
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
            BATALLA<span style={{ color: '#e91e8c' }}>GROUP</span>
          </h1>
          <p style={{ color: '#555', fontSize: 11, marginTop: 6, letterSpacing: '0.3em' }}>PANEL DE ADMINISTRACIÓN</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '2rem' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: '0.2em', display: 'block', marginBottom: 8 }}>CORREO</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="batallagroup@gmail.com"
              style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Courier New', monospace" }}
            />
          </div>

          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: '0.2em', display: 'block', marginBottom: 8 }}>CONTRASEÑA</label>
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 44px 12px 16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Courier New', monospace" }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <p style={{ color: '#e91e8c', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button onClick={login} style={{ width: '100%', padding: 14, background: '#e91e8c', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', letterSpacing: '0.1em', fontFamily: "'Courier New', monospace" }}>
            ENTRAR →
          </button>
        </div>
      </div>
    </div>
  );
}
