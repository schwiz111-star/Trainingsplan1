import { useMemo, useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';
import { todayStr, isoWeekKey, lastNWeekKeys } from '../lib/date.js';
import BarChart from './BarChart.jsx';

const STORAGE_KEY = 'tours';
const TYPES = ['Marsch', 'Lauf', 'Wanderung', 'Rad', 'Kraft', 'Sonstiges'];
const WEEKS = 8;

function emptyForm() {
  return {
    date: todayStr(),
    type: 'Marsch',
    distanceKm: '',
    durationMin: '',
    elevationM: '',
    extraWeightKg: '',
    notes: '',
  };
}

function formatPace(distanceKm, durationMin) {
  const dist = Number(distanceKm);
  const dur = Number(durationMin);
  if (!dist || !dur) return '–';
  const paceMin = dur / dist;
  const min = Math.floor(paceMin);
  const sec = Math.round((paceMin - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')} min/km`;
}

export default function Tours() {
  const [tours, setTours] = useState(() => loadState(STORAGE_KEY, []));
  const [form, setForm] = useState(emptyForm);

  function persist(next) {
    setTours(next);
    saveState(STORAGE_KEY, next);
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTour() {
    if (!form.date || !form.durationMin) return;
    const tour = { id: uid(), ...form };
    persist([tour, ...tours]);
    setForm(emptyForm());
  }

  function deleteTour(id) {
    persist(tours.filter((t) => t.id !== id));
  }

  const sortedTours = useMemo(
    () => [...tours].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [tours]
  );

  const weeklyChartData = useMemo(() => {
    const weekKeys = lastNWeekKeys(WEEKS);
    const totalsByWeek = {};
    for (const t of tours) {
      const key = isoWeekKey(t.date);
      const km = Number(t.distanceKm) || 0;
      totalsByWeek[key] = (totalsByWeek[key] ?? { km: 0, count: 0 });
      totalsByWeek[key].km += km;
      totalsByWeek[key].count += 1;
    }
    return weekKeys.map((key) => {
      const totals = totalsByWeek[key] ?? { km: 0, count: 0 };
      const weekNr = key.split('-W')[1];
      return {
        key,
        xLabel: `KW${weekNr}`,
        value: Math.round(totals.km * 10) / 10,
        tooltipTitle: `${Math.round(totals.km * 10) / 10} km`,
        tooltipSubtitle: `${key} · ${totals.count} Tour${totals.count === 1 ? '' : 'en'}`,
      };
    });
  }, [tours]);

  const maxKm = Math.max(10, ...weeklyChartData.map((d) => d.value));
  const yTicks = [0, Math.round(maxKm / 4), Math.round(maxKm / 2), Math.round((3 * maxKm) / 4), Math.ceil(maxKm)];

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Neue Tour erfassen</p>
        <div className="tour-form">
          <div className="field">
            <label htmlFor="tour-date">Datum</label>
            <input
              id="tour-date"
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tour-type">Typ</label>
            <select
              id="tour-type"
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tour-distance">Distanz (km)</label>
            <input
              id="tour-distance"
              value={form.distanceKm}
              onChange={(e) => updateField('distanceKm', e.target.value)}
              placeholder="optional bei Kraft"
              inputMode="decimal"
            />
          </div>
          <div className="field">
            <label htmlFor="tour-duration">Dauer (min)</label>
            <input
              id="tour-duration"
              value={form.durationMin}
              onChange={(e) => updateField('durationMin', e.target.value)}
              placeholder="90"
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label htmlFor="tour-elevation">Höhenmeter</label>
            <input
              id="tour-elevation"
              value={form.elevationM}
              onChange={(e) => updateField('elevationM', e.target.value)}
              placeholder="optional"
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label htmlFor="tour-weight">Zusatzgewicht (kg)</label>
            <input
              id="tour-weight"
              value={form.extraWeightKg}
              onChange={(e) => updateField('extraWeightKg', e.target.value)}
              placeholder="optional"
              inputMode="decimal"
            />
          </div>
          <div className="field tour-form-notes">
            <label htmlFor="tour-notes">Notizen</label>
            <input
              id="tour-notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="optional"
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={addTour}>
          Tour speichern
        </button>
      </section>

      {tours.length > 0 && (
        <section className="card">
          <h2>Wochenkilometer – letzte {WEEKS} Wochen</h2>
          <BarChart
            data={weeklyChartData}
            yTicks={yTicks}
            ariaLabel={`Balkendiagramm: Distanz pro Woche, letzte ${WEEKS} Wochen`}
            barColor="var(--series-2)"
            formatYTick={(v) => `${v}`}
          />
        </section>
      )}

      <section className="card">
        <p className="section-title">Touren-Verlauf</p>
        {sortedTours.length === 0 && (
          <p className="empty-state">Noch keine Touren erfasst.</p>
        )}
        {sortedTours.length > 0 && (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Typ</th>
                  <th>Distanz</th>
                  <th>Dauer</th>
                  <th>Tempo</th>
                  <th>Höhenmeter</th>
                  <th>Zusatzgewicht</th>
                  <th>Notizen</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedTours.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.type}</td>
                    <td>{t.distanceKm ? `${t.distanceKm} km` : '–'}</td>
                    <td>{t.durationMin} min</td>
                    <td>{formatPace(t.distanceKm, t.durationMin)}</td>
                    <td>{t.elevationM || '–'}</td>
                    <td>{t.extraWeightKg ? `${t.extraWeightKg} kg` : '–'}</td>
                    <td>{t.notes || '–'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => deleteTour(t.id)}
                        aria-label="Tour löschen"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
