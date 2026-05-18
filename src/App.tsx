import { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import VORDashboard from './pages/VORDashboard';
import BarrioAlerta from './pages/BarrioAlerta';
import YaVoy from './pages/YaVoy';

// Screen type lives in src/types.ts

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

  if (screen === 'login') return <Login onLogin={handleLogin} />;
  if (screen === 'home') return <Home onNavigate={setScreen} onLogout={handleLogout} />;
  if (screen === 'vor') return <VORDashboard onBack={() => setScreen('home')} />;
  if (screen === 'barrio') return <BarrioAlerta onBack={() => setScreen('home')} />;
  if (screen === 'yavoy') return <YaVoy onBack={() => setScreen('home')} />;

  return null;
}

