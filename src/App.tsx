import { useState, useEffect } from 'react';
import type { Screen } from './types';
import Login from './pages/Login';
import Home from './pages/Home';
import VORDashboard from './pages/VORDashboard';
import BarrioAlerta from './pages/BarrioAlerta';
import YaVoy from './pages/YaVoy';

function FullscreenButton() {
  const [isFS, setIsFS] = useState(false);

  useEffect(() => {
    const handler = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      title={isFS ? 'Salir de pantalla completa' : 'Pantalla completa'}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 38,
        height: 38,
        borderRadius: 10,
        background: 'rgba(10,10,22,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        color: isFS ? '#3b82f6' : '#4a4a78',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)';
        (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
        (e.currentTarget as HTMLButtonElement).style.color = isFS ? '#3b82f6' : '#4a4a78';
      }}
    >
      {isFS ? '⛶' : '⛶'}
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return sessionStorage.getItem('bg_auth') === '1' ? 'home' : 'login';
  });

  const handleLogin = () => {
    sessionStorage.setItem('bg_auth', '1');
    setScreen('home');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bg_auth');
    setScreen('login');
  };

  return (
    <>
      <FullscreenButton />
      {screen === 'login'  && <Login onLogin={handleLogin} />}
      {screen === 'home'   && <Home onNavigate={setScreen} onLogout={handleLogout} />}
      {screen === 'vor'    && <VORDashboard onBack={() => setScreen('home')} />}
      {screen === 'barrio' && <BarrioAlerta onBack={() => setScreen('home')} />}
      {screen === 'yavoy'  && <YaVoy onBack={() => setScreen('home')} />}
    </>
  );
}
