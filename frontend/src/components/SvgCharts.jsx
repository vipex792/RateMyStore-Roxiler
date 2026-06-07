import { useState, useEffect } from 'react';

// Custom BarChart component
export function BarChart({ data = [], labels = [], title = 'Rating Distribution', color = '#7C3AED' }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, val: 0, label: '' });

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const maxValue = Math.max(...data, 1);
  const height = 180;
  const width = 450;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 10;
  const paddingRight = 10;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  return (
    <div className="chart-container" style={{ position: 'relative' }}>
      <div className="chart-header">
        <h4 className="chart-title">{title}</h4>
      </div>
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="svg-chart-element">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const value = Math.round(maxValue * ratio);
            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((val, index) => {
            const barCount = data.length;
            const step = chartWidth / barCount;
            const barWidth = Math.max(step * 0.6, 16);
            const x = paddingLeft + index * step + (step - barWidth) / 2;
            const barHeight = animated ? (val / maxValue) * chartHeight : 0;
            const y = height - paddingBottom - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill={color}
                  rx="4"
                  opacity="0.85"
                  style={{
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      x: x + barWidth / 2,
                      y: y - 35,
                      val,
                      label: labels[index] || `Item ${index + 1}`,
                    });
                  }}
                  onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {labels[index] || index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {tooltip.visible && (
          <div
            className="svg-chart-tooltip"
            style={{
              opacity: 1,
              left: `${(tooltip.x / width) * 100}%`,
              top: `${(tooltip.y / height) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              position: 'absolute',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
            }}
          >
            <strong>{tooltip.label}</strong>: {tooltip.val}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom LineChart component
export function LineChart({ data = [], title = 'Activity Trend', color = '#3B82F6', gradientColor = 'rgba(59, 130, 246, 0.15)' }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, val: 0, label: '' });

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const labels = data.map((d) => d.label);

  const height = 180;
  const width = 450;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 10;
  const paddingRight = 15;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  // Generate SVG coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const ratio = d.value / maxValue;
    const y = paddingTop + chartHeight * (1 - ratio);
    return { x, y, val: d.value, label: d.label };
  });

  // SVG Line path string
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${animated ? points[0].y : height - paddingBottom}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${animated ? points[i].y : height - paddingBottom}`;
    }

    areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div className="chart-container" style={{ position: 'relative' }}>
      <div className="chart-header">
        <h4 className="chart-title">{title}</h4>
      </div>
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="svg-chart-element">
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(maxValue * ratio);
            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
              style={{
                transition: 'd 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'd 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}

          {/* Data Points / Interactivity Dots */}
          {points.map((p, index) => {
            return (
              <g key={index}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--bg-secondary)"
                  stroke={color}
                  strokeWidth="2"
                  style={{
                    transition: 'cy 1.2s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => {
                    setTooltip({
                      visible: true,
                      x: p.x,
                      y: p.y - 35,
                      val: p.val,
                      label: p.label,
                    });
                  }}
                  onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                />
                {/* X labels */}
                {index % Math.ceil(points.length / 6) === 0 && (
                  <text
                    x={p.x}
                    y={height - 10}
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {tooltip.visible && (
          <div
            className="svg-chart-tooltip"
            style={{
              opacity: 1,
              left: `${(tooltip.x / width) * 100}%`,
              top: `${(tooltip.y / height) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              position: 'absolute',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
            }}
          >
            <strong>{tooltip.label}</strong>: {tooltip.val}
          </div>
        )}
      </div>
    </div>
  );
}
