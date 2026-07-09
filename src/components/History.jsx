import { useMemo, useState } from 'react';
import { loadState } from '../lib/storage.js';
import { lastNDays, weekdayLabel, shortLabel } from '../lib/date.js';
import BarChart from './BarChart.jsx';

const DAYS = 14;
const GRID_VALUES = [0, 25, 50, 75, 100];

export default function History() {
  const [showTable, setShowTable] = useState(false);

  const habits = useMemo(() => loadState('habits', []), []);
  const habitLog = useMemo(() => loadState('habitLog', {}), []);
  const challengeLog = useMemo(() => loadState('challengeLog', {}), []);

  const days = useMemo(() => lastNDays(DAYS), []);

  const data = useMemo(() => {
    return days.map((dateStr) => {
      const dayLog = habitLog[dateStr] ?? {};
      const doneCount = habits.filter((h) => dayLog[h.id]).length;
      const total = habits.length;
      const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
      const challengeDone = !!challengeLog[dateStr];
      return { dateStr, doneCount, total, percent, challengeDone };
    });
  }, [days, habits, habitLog, challengeLog]);

  if (habits.length === 0) {
    return (
      <div className="app-main">
        <section className="card">
          <p className="empty-state">
            Sobald du Habits angelegt und ein paar Tage abgehakt hast, siehst du hier
            deinen Verlauf.
          </p>
        </section>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    key: d.dateStr,
    xLabel: weekdayLabel(d.dateStr),
    value: d.percent,
    tooltipTitle: `${d.percent}%`,
    tooltipSubtitle: `${shortLabel(d.dateStr)} · ${d.doneCount}/${d.total} Habits`,
  }));

  return (
    <div className="app-main">
      <section className="card">
        <div className="plan-header">
          <h2>Habit-Quote – letzte {DAYS} Tage</h2>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? 'Diagramm anzeigen' : 'Als Tabelle anzeigen'}
          </button>
        </div>

        {!showTable && (
          <BarChart
            data={chartData}
            yTicks={GRID_VALUES}
            ariaLabel={`Balkendiagramm: erledigte Habits in Prozent, letzte ${DAYS} Tage`}
            formatYTick={(v) => String(v)}
          />
        )}

        {showTable && (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Habits erledigt</th>
                  <th>Quote</th>
                  <th>Challenge</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.dateStr}>
                    <td>{shortLabel(d.dateStr)}</td>
                    <td>
                      {d.doneCount}/{d.total}
                    </td>
                    <td>{d.percent}%</td>
                    <td>{d.challengeDone ? 'erledigt' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <p className="section-title">Tägliche Challenge</p>
        <div className="challenge-strip">
          {data.map((d) => (
            <div
              key={d.dateStr}
              className={`challenge-dot ${d.challengeDone ? 'challenge-dot--done' : ''}`}
              title={`${d.dateStr}: ${d.challengeDone ? 'erledigt' : 'nicht erledigt'}`}
            />
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--good" /> erledigt
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--muted" /> offen
          </span>
        </div>
      </section>
    </div>
  );
}
