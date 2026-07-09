import { useState } from 'react';
import TrainingPlans from './components/TrainingPlans.jsx';
import Habits from './components/Habits.jsx';
import DailyChallenge from './components/DailyChallenge.jsx';
import History from './components/History.jsx';
import './App.css';

const TABS = [
  { id: 'plans', label: 'Trainingspläne' },
  { id: 'habits', label: 'Habits' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'history', label: 'Verlauf' },
];

function App() {
  const [tab, setTab] = useState('plans');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trainingsplan</h1>
        <p className="app-subtitle">Deine Vorbereitung, strukturiert.</p>
      </header>

      <nav className="tab-nav" role="tablist" aria-label="Bereiche">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab-button ${tab === t.id ? 'tab-button--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'plans' && <TrainingPlans />}
        {tab === 'habits' && <Habits />}
        {tab === 'challenge' && <DailyChallenge />}
        {tab === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;
