import { useMemo, useState } from 'react';
import { loadState } from '../lib/storage.js';
import { lastNDays, weekdayLabel, shortLabel } from '../lib/date.js';

const DAYS = 14;
const CHART_W = 700;
const CHART_H = 220;
const PAD_LEFT = 34;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 26;
const GRID_VALUES = [0, 25, 50, 75, 100];

function topRoundedRectPath(x, y, w, h, r) {
  const radius = Math.min(r, h, w / 2);
  if (h <= 0) return '';
  if (radius <= 0) {
    return `M${x},${y + h} L${x},${y} L${x + w},${y} L${x + w},${y + h} Z`;
  }
  return `M${x},${y + h}
    L${x},${y + radius}
    Q${x},${y} ${x + radius},${y}
    L${x + w - radius},${y}
    Q${x + w},${y} ${x + w},${y + radius}
    L${x + w},${y + h}
    Z`;
}

export default function History() {
  const [showTable, setShowTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

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

  const innerW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const slotW = innerW / DAYS;
  const barW = Math.min(24, slotW - 4);

  function yFor(percent) {
    return PAD_TOP + innerH - (percent / 100) * innerH;
  }

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
          <div className="chart-wrap">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="history-chart"
              role="img"
              aria-label={`Balkendiagramm: erledigte Habits in Prozent, letzte ${DAYS} Tage`}
            >
              {GRID_VALUES.map((v) => (
                <g key={v}>
                  <line
                    x1={PAD_LEFT}
                    x2={CHART_W - PAD_RIGHT}
                    y1={yFor(v)}
                    y2={yFor(v)}
                    className={v === 0 ? 'chart-baseline' : 'chart-gridline'}
                  />
                  <text x={PAD_LEFT - 8} y={yFor(v)} className="chart-tick" textAnchor="end" dy="0.32em">
                    {v}
                  </text>
                </g>
              ))}

              {data.map((d, i) => {
                const x = PAD_LEFT + i * slotW + (slotW - barW) / 2;
                const h = (d.percent / 100) * innerH;
                const y = PAD_TOP + innerH - h;
                const isHover = hoverIndex === i;
                return (
                  <g
                    key={d.dateStr}
                    tabIndex={0}
                    role="img"
                    aria-label={`${d.dateStr}: ${d.percent} Prozent, ${d.doneCount} von ${d.total} Habits erledigt`}
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onFocus={() => setHoverIndex(i)}
                    onBlur={() => setHoverIndex(null)}
                    className="chart-bar-group"
                  >
                    <rect
                      x={PAD_LEFT + i * slotW}
                      y={PAD_TOP}
                      width={slotW}
                      height={innerH}
                      fill="transparent"
                    />
                    <path
                      d={topRoundedRectPath(x, y, barW, h, 4)}
                      fill="var(--series-1)"
                      opacity={isHover ? 1 : 0.9}
                    />
                    <text
                      x={PAD_LEFT + i * slotW + slotW / 2}
                      y={CHART_H - PAD_BOTTOM + 16}
                      className="chart-tick"
                      textAnchor="middle"
                    >
                      {weekdayLabel(d.dateStr)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoverIndex !== null && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${((PAD_LEFT + hoverIndex * slotW + slotW / 2) / CHART_W) * 100}%`,
                }}
              >
                <strong>{data[hoverIndex].percent}%</strong>
                <span>
                  {shortLabel(data[hoverIndex].dateStr)} · {data[hoverIndex].doneCount}/
                  {data[hoverIndex].total} Habits
                </span>
              </div>
            )}
          </div>
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
