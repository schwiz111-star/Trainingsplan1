import { useState } from 'react';

const CHART_W = 700;
const CHART_H = 220;
const PAD_LEFT = 40;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 26;

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

/**
 * data: [{ key, xLabel, value, tooltipTitle, tooltipSubtitle }]
 * yTicks: ascending numbers, first entry is the baseline (usually 0)
 */
export default function BarChart({
  data,
  yTicks,
  ariaLabel,
  barColor = 'var(--series-1)',
  formatYTick = (v) => String(v),
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const innerW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const slotW = innerW / data.length;
  const barW = Math.min(24, slotW - 4);
  const maxTick = yTicks[yTicks.length - 1];
  const minTick = yTicks[0];

  function yFor(value) {
    const ratio = (value - minTick) / (maxTick - minTick || 1);
    return PAD_TOP + innerH - ratio * innerH;
  }

  const baselineY = yFor(minTick);

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="bar-chart"
        role="img"
        aria-label={ariaLabel}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              x2={CHART_W - PAD_RIGHT}
              y1={yFor(v)}
              y2={yFor(v)}
              className={v === minTick ? 'chart-baseline' : 'chart-gridline'}
            />
            <text x={PAD_LEFT - 8} y={yFor(v)} className="chart-tick" textAnchor="end" dy="0.32em">
              {formatYTick(v)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD_LEFT + i * slotW + (slotW - barW) / 2;
          const barTopY = yFor(d.value);
          const h = baselineY - barTopY;
          const isHover = hoverIndex === i;
          return (
            <g
              key={d.key}
              tabIndex={0}
              role="img"
              aria-label={`${d.xLabel}: ${d.tooltipTitle}${d.tooltipSubtitle ? ', ' + d.tooltipSubtitle : ''}`}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onFocus={() => setHoverIndex(i)}
              onBlur={() => setHoverIndex(null)}
              className="chart-bar-group"
            >
              <rect x={PAD_LEFT + i * slotW} y={PAD_TOP} width={slotW} height={innerH} fill="transparent" />
              {h > 0 && (
                <path
                  d={topRoundedRectPath(x, barTopY, barW, h, 4)}
                  fill={barColor}
                  opacity={isHover ? 1 : 0.9}
                />
              )}
              <text
                x={PAD_LEFT + i * slotW + slotW / 2}
                y={CHART_H - PAD_BOTTOM + 16}
                className="chart-tick"
                textAnchor="middle"
              >
                {d.xLabel}
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
          <strong>{data[hoverIndex].tooltipTitle}</strong>
          {data[hoverIndex].tooltipSubtitle && <span>{data[hoverIndex].tooltipSubtitle}</span>}
        </div>
      )}
    </div>
  );
}
