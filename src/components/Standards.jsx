import { useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';

const STORAGE_KEY = 'standards';

function emptyForm() {
  return { name: '', target: '', current: '', achieved: false, notes: '' };
}

export default function Standards() {
  const [standards, setStandards] = useState(() => loadState(STORAGE_KEY, []));
  const [form, setForm] = useState(emptyForm);

  function persist(next) {
    setStandards(next);
    saveState(STORAGE_KEY, next);
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addStandard() {
    const name = form.name.trim();
    if (!name) return;
    persist([...standards, { id: uid(), ...form, name }]);
    setForm(emptyForm());
  }

  function updateStandard(id, field, value) {
    persist(standards.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function deleteStandard(id) {
    persist(standards.filter((s) => s.id !== id));
  }

  const achievedCount = standards.filter((s) => s.achieved).length;

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Neuer Standard</p>
        <p className="field-hint">
          Trag hier die Zielwerte ein, die du für deine Selektion/Zieleinheit kennst
          (z.B. aus dem offiziellen Anforderungsprofil) – die App erfindet hier nichts.
        </p>
        <div className="tour-form">
          <div className="field tour-form-notes">
            <label htmlFor="std-name">Test / Übung</label>
            <input
              id="std-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="z.B. Rucksackmarsch 25 km mit 25 kg"
            />
          </div>
          <div className="field">
            <label htmlFor="std-target">Zielwert</label>
            <input
              id="std-target"
              value={form.target}
              onChange={(e) => updateField('target', e.target.value)}
              placeholder="z.B. unter 180 min"
            />
          </div>
          <div className="field">
            <label htmlFor="std-current">Aktueller Bestwert</label>
            <input
              id="std-current"
              value={form.current}
              onChange={(e) => updateField('current', e.target.value)}
              placeholder="z.B. 210 min"
            />
          </div>
          <div className="field tour-form-notes">
            <label htmlFor="std-notes">Notizen</label>
            <input
              id="std-notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="optional"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={addStandard}>
          Standard speichern
        </button>
      </section>

      <section className="card">
        <div className="plan-header">
          <h2>Deine Standards</h2>
          {standards.length > 0 && (
            <span className="habit-count">
              {achievedCount} / {standards.length} erreicht
            </span>
          )}
        </div>

        {standards.length === 0 && (
          <p className="empty-state">Noch keine Standards erfasst.</p>
        )}

        {standards.length > 0 && (
          <ul className="standards-list">
            {standards.map((s) => (
              <li key={s.id} className="standard-item">
                <div className="standard-main">
                  <span className={`status-pill ${s.achieved ? 'status-pill--good' : 'status-pill--open'}`}>
                    {s.achieved ? '✓ erreicht' : 'offen'}
                  </span>
                  <span className="standard-name">{s.name}</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => deleteStandard(s.id)}
                    aria-label={`${s.name} löschen`}
                  >
                    ✕
                  </button>
                </div>
                <div className="standard-values">
                  <label className="standard-value-field">
                    Ziel
                    <input
                      value={s.target}
                      onChange={(e) => updateStandard(s.id, 'target', e.target.value)}
                    />
                  </label>
                  <label className="standard-value-field">
                    Aktuell
                    <input
                      value={s.current}
                      onChange={(e) => updateStandard(s.id, 'current', e.target.value)}
                    />
                  </label>
                  <label className="standard-achieved-toggle">
                    <input
                      type="checkbox"
                      checked={!!s.achieved}
                      onChange={(e) => updateStandard(s.id, 'achieved', e.target.checked)}
                    />
                    erreicht
                  </label>
                </div>
                {s.notes && <p className="standard-notes">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
