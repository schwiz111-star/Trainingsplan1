import { useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';
import { todayStr } from '../lib/date.js';

const HABITS_KEY = 'habits';
const LOG_KEY = 'habitLog';

const DEFAULT_HABITS = [
  'Vor 06:00 Uhr aufstehen',
  'Bett direkt machen',
  'Kalt duschen (mind. 30 Sek.)',
  'Mind. 3 Liter Wasser trinken',
  'Trainingseinheit laut Plan absolviert',
  '15 Min Mobility/Stretching',
  'Mind. 7 Stunden Schlaf',
  'Saubere Ernährung, kein Zucker',
  'Ausrüstung kontrolliert & bereit',
  '10 Min mentales Training (Atmung/Visualisierung)',
];

function seedHabitsIfNeeded() {
  const stored = loadState(HABITS_KEY, null);
  if (stored !== null) return stored;
  const seeded = DEFAULT_HABITS.map((name) => ({ id: uid(), name }));
  saveState(HABITS_KEY, seeded);
  return seeded;
}

export default function Habits() {
  const [habits, setHabits] = useState(seedHabitsIfNeeded);
  const [log, setLog] = useState(() => loadState(LOG_KEY, {}));
  const [newHabit, setNewHabit] = useState('');
  const today = todayStr();
  const todayLog = log[today] ?? {};

  function persistHabits(next) {
    setHabits(next);
    saveState(HABITS_KEY, next);
  }

  function persistLog(next) {
    setLog(next);
    saveState(LOG_KEY, next);
  }

  function addHabit() {
    const name = newHabit.trim();
    if (!name) return;
    persistHabits([...habits, { id: uid(), name }]);
    setNewHabit('');
  }

  function deleteHabit(habitId) {
    persistHabits(habits.filter((h) => h.id !== habitId));
  }

  function toggleHabit(habitId) {
    const nextDayLog = { ...todayLog, [habitId]: !todayLog[habitId] };
    persistLog({ ...log, [today]: nextDayLog });
  }

  const doneCount = habits.filter((h) => todayLog[h.id]).length;

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Neuer Habit</p>
        <div className="row">
          <div className="field">
            <label htmlFor="habit-name">Was willst du täglich schaffen?</label>
            <input
              id="habit-name"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder="z.B. 30 Min Mobility"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={addHabit}>
            Habit hinzufügen
          </button>
        </div>
      </section>

      <section className="card">
        <div className="plan-header">
          <h2>Heute</h2>
          {habits.length > 0 && (
            <span className="habit-count">
              {doneCount} / {habits.length} erledigt
            </span>
          )}
        </div>

        {habits.length === 0 && (
          <p className="empty-state">
            Noch keine Habits angelegt. Füge oben deinen ersten Habit hinzu.
          </p>
        )}

        {habits.length > 0 && (
          <ul className="habit-list">
            {habits.map((h) => {
              const checked = !!todayLog[h.id];
              return (
                <li key={h.id} className="habit-item">
                  <label className="habit-label">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHabit(h.id)}
                    />
                    <span className={checked ? 'habit-name habit-name--done' : 'habit-name'}>
                      {h.name}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => deleteHabit(h.id)}
                    aria-label={`${h.name} löschen`}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
