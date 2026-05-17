import { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import VORDashboard from './pages/VORDashboard';

import type { Screen } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');

  if (screen === 'login') return <Login onLogin={() => setScreen('home')} />;
  if (screen === 'home') return <Home onNavigate={setScreen} onLogout={() => setScreen('login')} />;
  if (screen === 'vor') return <VORDashboard onBack={() => setScreen('home')} />;

  return null;
}
