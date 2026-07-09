import { useMemo, useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';
import { todayStr, lastNDays, weekdayLabel, shortLabel } from '../lib/date.js';
import { overtrainingStatus } from '../lib/trainingLoad.js';
import BarChart from './BarChart.jsx';

const SLEEP_KEY = 'sleepLog';
const INJURY_KEY = 'injuryLog';
const DAYS = 14;

function emptyInjuryForm() {
  return { date: todayStr(), bodyPart: '', severity: '5', notes: '', resolved: false };
}

export default function Health() {
  const [sleepLog, setSleepLog] = useState(() => loadState(SLEEP_KEY, {}));
  const [injuries, setInjuries] = useState(() => loadState(INJURY_KEY, []));
  const [injuryForm, setInjuryForm] = useState(emptyInjuryForm);
  const tours = useMemo(() => loadState('tours', []), []);
  const today = todayStr();

  function persistSleep(next) {
    setSleepLog(next);
    saveState(SLEEP_KEY, next);
  }

  function persistInjuries(next) {
    setInjuries(next);
    saveState(INJURY_KEY, next);
  }

  function updateTodaySleep(value) {
    persistSleep({ ...sleepLog, [today]: value });
  }

  function updateInjuryField(field, value) {
    setInjuryForm((f) => ({ ...f, [field]: value }));
  }

  function addInjury() {
    const bodyPart = injuryForm.bodyPart.trim();
    if (!bodyPart) return;
    persistInjuries([{ id: uid(), ...injuryForm, bodyPart }, ...injuries]);
    setInjuryForm(emptyInjuryForm());
  }

  function toggleResolved(id) {
    persistInjuries(
      injuries.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i))
    );
  }

  function deleteInjury(id) {
    persistInjuries(injuries.filter((i) => i.id !== id));
  }

  const days = useMemo(() => lastNDays(DAYS), []);
  const sleepChartData = days.map((d) => ({
    key: d,
    xLabel: weekdayLabel(d),
    value: Number(sleepLog[d]) || 0,
    tooltipTitle: sleepLog[d] ? `${sleepLog[d]} h` : 'keine Angabe',
    tooltipSubtitle: shortLabel(d),
  }));

  const training = overtrainingStatus(tours);
  const openInjuries = injuries.filter((i) => !i.resolved);

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Trainingsbelastung</p>
        {training.level === 'unknown' && (
          <p className="empty-state">
            Noch nicht genug Wochen mit Touren erfasst, um die Belastung einzuschätzen.
          </p>
        )}
        {training.level === 'good' && (
          <div className="status-banner status-banner--good">
            <span className="status-pill status-pill--good">✓ im Rahmen</span>
            <span>
              Diese Woche {training.currentMinutes} min, Schnitt zuvor{' '}
              {training.avgPreviousMinutes} min – Belastung im normalen Rahmen.
            </span>
          </div>
        )}
        {training.level === 'warning' && (
          <div className="status-banner status-banner--warning">
            <span className="status-pill status-pill--warning">⚠ Achtung</span>
            <span>
              Diese Woche {training.currentMinutes} min, Schnitt zuvor{' '}
              {training.avgPreviousMinutes} min – das ist ein deutlicher Sprung.
              Übertrainings-/Verletzungsrisiko im Auge behalten.
            </span>
          </div>
        )}
      </section>

      <section className="card">
        <p className="section-title">Schlaf – letzte {DAYS} Tage</p>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="sleep-today">Stunden geschlafen (heute)</label>
            <input
              id="sleep-today"
              value={sleepLog[today] ?? ''}
              onChange={(e) => updateTodaySleep(e.target.value)}
              placeholder="7.5"
              inputMode="decimal"
            />
          </div>
        </div>
        <BarChart
          data={sleepChartData}
          yTicks={[0, 2, 4, 6, 8, 10]}
          ariaLabel={`Balkendiagramm: Schlafstunden, letzte ${DAYS} Tage`}
          barColor="var(--series-5)"
          formatYTick={(v) => `${v}h`}
        />
      </section>

      <section className="card">
        <p className="section-title">Neuer Schmerz-/Verletzungseintrag</p>
        <div className="tour-form">
          <div className="field">
            <label htmlFor="inj-date">Datum</label>
            <input
              id="inj-date"
              type="date"
              value={injuryForm.date}
              onChange={(e) => updateInjuryField('date', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="inj-part">Körperstelle</label>
            <input
              id="inj-part"
              value={injuryForm.bodyPart}
              onChange={(e) => updateInjuryField('bodyPart', e.target.value)}
              placeholder="z.B. linkes Knie"
            />
          </div>
          <div className="field">
            <label htmlFor="inj-severity">Schweregrad (1–10)</label>
            <input
              id="inj-severity"
              value={injuryForm.severity}
              onChange={(e) => updateInjuryField('severity', e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="field tour-form-notes">
            <label htmlFor="inj-notes">Notizen</label>
            <input
              id="inj-notes"
              value={injuryForm.notes}
              onChange={(e) => updateInjuryField('notes', e.target.value)}
              placeholder="optional"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={addInjury}>
          Eintrag speichern
        </button>
      </section>

      <section className="card">
        <div className="plan-header">
          <h2>Schmerz-/Verletzungstagebuch</h2>
          {injuries.length > 0 && (
            <span className="habit-count">{openInjuries.length} offen</span>
          )}
        </div>
        {injuries.length === 0 && (
          <p className="empty-state">Noch keine Einträge – hoffentlich bleibt das so.</p>
        )}
        {injuries.length > 0 && (
          <ul className="standards-list">
            {injuries.map((i) => {
              const severity = Number(i.severity) || 0;
              const severityClass =
                severity >= 7 ? 'status-pill--critical' : severity >= 4 ? 'status-pill--warning' : 'status-pill--good';
              return (
                <li key={i.id} className="standard-item">
                  <div className="standard-main">
                    <span className={`status-pill ${severityClass}`}>Grad {i.severity}</span>
                    <span className="standard-name">
                      {i.bodyPart} · {i.date}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => deleteInjury(i.id)}
                      aria-label={`${i.bodyPart} Eintrag löschen`}
                    >
                      ✕
                    </button>
                  </div>
                  {i.notes && <p className="standard-notes">{i.notes}</p>}
                  <label className="standard-achieved-toggle">
                    <input
                      type="checkbox"
                      checked={!!i.resolved}
                      onChange={() => toggleResolved(i.id)}
                    />
                    behoben
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
