import { useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { todayStr } from '../lib/date.js';
import { challengeForDate } from '../lib/challenges.js';

const LOG_KEY = 'challengeLog';

export default function DailyChallenge() {
  const [log, setLog] = useState(() => loadState(LOG_KEY, {}));
  const today = todayStr();
  const challengeText = challengeForDate(today);
  const done = !!log[today];

  function toggleDone() {
    const next = { ...log, [today]: !done };
    setLog(next);
    saveState(LOG_KEY, next);
  }

  return (
    <div className="app-main">
      <section className="card challenge-card">
        <p className="section-title">Challenge des Tages</p>
        <p className="challenge-text">{challengeText}</p>
        <button
          type="button"
          className={done ? 'btn btn-primary' : 'btn'}
          onClick={toggleDone}
        >
          {done ? 'Erledigt ✓' : 'Als erledigt markieren'}
        </button>
      </section>
    </div>
  );
}
