import { useState } from 'react';
import TrainingPlans from './components/TrainingPlans.jsx';
import Tours from './components/Tours.jsx';
import Habits from './components/Habits.jsx';
import DailyChallenge from './components/DailyChallenge.jsx';
import History from './components/History.jsx';
import Calories from './components/Calories.jsx';
import './App.css';

const TABS = [
  { id: 'plans', label: 'Trainingspläne' },
  { id: 'tours', label: 'Touren' },
  { id: 'habits', label: 'Habits' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'history', label: 'Verlauf' },
  { id: 'calories', label: 'Kalorien' },
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
        {tab === 'tours' && <Tours />}
        {tab === 'habits' && <Habits />}
        {tab === 'challenge' && <DailyChallenge />}
        {tab === 'history' && <History />}
        {tab === 'calories' && <Calories />}
      </main>
    </div>
  );
}

export default App;
