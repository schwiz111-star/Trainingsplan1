import { useState } from 'react';
import TrainingPlans from './components/TrainingPlans.jsx';
import Tours from './components/Tours.jsx';
import Standards from './components/Standards.jsx';
import Habits from './components/Habits.jsx';
import DailyChallenge from './components/DailyChallenge.jsx';
import Health from './components/Health.jsx';
import History from './components/History.jsx';
import Calories from './components/Calories.jsx';
import Planning from './components/Planning.jsx';
import './App.css';

const TABS = [
  { id: 'plans', label: 'Trainingspläne' },
  { id: 'tours', label: 'Touren' },
  { id: 'standards', label: 'Standards' },
  { id: 'habits', label: 'Habits' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'health', label: 'Gesundheit' },
  { id: 'history', label: 'Verlauf' },
  { id: 'calories', label: 'Kalorien' },
  { id: 'planning', label: 'Planung' },
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
        {tab === 'standards' && <Standards />}
        {tab === 'habits' && <Habits />}
        {tab === 'challenge' && <DailyChallenge />}
        {tab === 'health' && <Health />}
        {tab === 'history' && <History />}
        {tab === 'calories' && <Calories />}
        {tab === 'planning' && <Planning />}
      </main>
    </div>
  );
}

export default App;
