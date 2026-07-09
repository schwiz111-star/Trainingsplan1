import { useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';
import { daysUntil, phaseForDaysRemaining } from '../lib/planning.js';

const PLANNING_KEY = 'planning';
const GEAR_KEY = 'gearChecklist';

const DEFAULT_GEAR = [
  'Rucksack eingespielt & richtig eingestellt',
  'Wanderschuhe eingelaufen',
  'Ersatzsocken (mehrere Paar)',
  'Erste-Hilfe-Set',
  'Karte & Kompass',
  'Stirnlampe + Ersatzbatterien',
  'Trinksystem/Feldflaschen',
  'Wetterschutz (Regenjacke/Poncho)',
  'Verpflegung für Übungsmärsche',
  'Blasenpflaster/Tape',
];

function seedGearIfNeeded() {
  const stored = loadState(GEAR_KEY, null);
  if (stored !== null) return stored;
  const seeded = DEFAULT_GEAR.map((name) => ({ id: uid(), name, checked: false }));
  saveState(GEAR_KEY, seeded);
  return seeded;
}

export default function Planning() {
  const [planning, setPlanning] = useState(() => loadState(PLANNING_KEY, { selectionDate: '' }));
  const [gear, setGear] = useState(seedGearIfNeeded);
  const [newGearItem, setNewGearItem] = useState('');

  function updateSelectionDate(value) {
    const next = { ...planning, selectionDate: value };
    setPlanning(next);
    saveState(PLANNING_KEY, next);
  }

  function persistGear(next) {
    setGear(next);
    saveState(GEAR_KEY, next);
  }

  function toggleGear(id) {
    persistGear(gear.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g)));
  }

  function deleteGear(id) {
    persistGear(gear.filter((g) => g.id !== id));
  }

  function addGear() {
    const name = newGearItem.trim();
    if (!name) return;
    persistGear([...gear, { id: uid(), name, checked: false }]);
    setNewGearItem('');
  }

  const days = planning.selectionDate ? daysUntil(planning.selectionDate) : null;
  const phase = days !== null ? phaseForDaysRemaining(days) : null;
  const checkedGearCount = gear.filter((g) => g.checked).length;

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Selektionstermin</p>
        <div className="field">
          <label htmlFor="plan-date">Datum</label>
          <input
            id="plan-date"
            type="date"
            value={planning.selectionDate}
            onChange={(e) => updateSelectionDate(e.target.value)}
          />
        </div>

        {phase && (
          <div className="plan-phase">
            {phase.id === 'past' ? (
              <p className="empty-state">{phase.label}</p>
            ) : (
              <>
                <div className="plan-countdown">
                  <span className="plan-countdown-value">
                    {days} {days === 1 ? 'Tag' : 'Tage'}
                  </span>
                  <span className="plan-countdown-label">bis zur Selektion</span>
                </div>
                <div className="plan-phase-info">
                  <span className="status-pill status-pill--open">{phase.label}</span>
                  <p>{phase.advice}</p>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <div className="plan-header">
          <h2>Ausrüstung</h2>
          {gear.length > 0 && (
            <span className="habit-count">
              {checkedGearCount} / {gear.length} bereit
            </span>
          )}
        </div>

        <div className="row" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="gear-name">Weiterer Ausrüstungsgegenstand</label>
            <input
              id="gear-name"
              value={newGearItem}
              onChange={(e) => setNewGearItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGear()}
              placeholder="z.B. Biwaksack"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={addGear}>
            Hinzufügen
          </button>
        </div>

        {gear.length === 0 && <p className="empty-state">Noch keine Ausrüstung erfasst.</p>}

        {gear.length > 0 && (
          <ul className="habit-list">
            {gear.map((g) => (
              <li key={g.id} className="habit-item">
                <label className="habit-label">
                  <input type="checkbox" checked={g.checked} onChange={() => toggleGear(g.id)} />
                  <span className={g.checked ? 'habit-name habit-name--done' : 'habit-name'}>
                    {g.name}
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={() => deleteGear(g.id)}
                  aria-label={`${g.name} löschen`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
