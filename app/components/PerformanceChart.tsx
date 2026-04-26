/**
 * PerformanceChart — Vault-themed radar chart + stat bars for Beyblade specs.
 *
 * Pure SVG radar chart, no external dependencies.
 * Designed for the Tokyo Spin Vault dark theme (gold × black × chrome).
 */

interface StatData {
  attack: number;
  stamina: number;
  defense: number;
  burst: number;
  versatility: number;
}

interface PerformanceChartProps {
  stats: StatData;
  staminaRange?: string;
  beybladeType?: string;
}

const LABELS: {key: keyof StatData; label: string; short: string}[] = [
  {key: 'attack', label: 'Attack', short: 'ATK'},
  {key: 'stamina', label: 'Stamina', short: 'STA'},
  {key: 'defense', label: 'Defense', short: 'DEF'},
  {key: 'burst', label: 'Burst Res.', short: 'BRS'},
  {key: 'versatility', label: 'Versatility', short: 'VER'},
];

const TYPE_COLORS: Record<
  string,
  {fill: string; stroke: string; glow: string}
> = {
  Attack: {fill: 'rgba(59,130,246,0.15)', stroke: '#3B82F6', glow: '#3B82F6'},
  Defense: {fill: 'rgba(34,197,94,0.15)', stroke: '#22C55E', glow: '#22C55E'},
  Stamina: {fill: 'rgba(249,115,22,0.15)', stroke: '#F97316', glow: '#F97316'},
  Balance: {fill: 'rgba(239,68,68,0.15)', stroke: '#EF4444', glow: '#EF4444'},
};

const DEFAULT_COLOR = {
  fill: 'rgba(255,215,0,0.12)',
  stroke: '#FFD700',
  glow: '#DAA520',
};

/** Convert polar to cartesian for SVG pentagon points */
function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function RadarChart({
  stats,
  beybladeType,
}: {
  stats: StatData;
  beybladeType?: string;
}) {
  const cx = 140;
  const cy = 145;
  const maxR = 85;
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
  const color = (beybladeType && TYPE_COLORS[beybladeType]) || DEFAULT_COLOR;

  // Build pentagon points for each ring
  const ringPaths = rings.map((scale) => {
    const r = maxR * scale;
    const points = LABELS.map((_, i) => {
      const angle = (360 / LABELS.length) * i;
      return polarToXY(cx, cy, r, angle);
    });
    return points.map((p) => p.join(',')).join(' ');
  });

  // Build data polygon
  const dataPoints = LABELS.map((l, i) => {
    const val = Math.min(stats[l.key] / 5, 1);
    const r = maxR * val;
    const angle = (360 / LABELS.length) * i;
    return polarToXY(cx, cy, r, angle);
  });
  const dataPath = dataPoints.map((p) => p.join(',')).join(' ');

  // Label positions (slightly outside the chart)
  const labelPositions = LABELS.map((l, i) => {
    const angle = (360 / LABELS.length) * i;
    const [x, y] = polarToXY(cx, cy, maxR + 22, angle);
    return {x, y, ...l, value: stats[l.key]};
  });

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="dataFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color.stroke} stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {ringPaths.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={i === ringPaths.length - 1 ? '1' : '0.5'}
        />
      ))}

      {/* Axis lines */}
      {LABELS.map((_, i) => {
        const angle = (360 / LABELS.length) * i;
        const [x2, y2] = polarToXY(cx, cy, maxR, angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPath}
        fill="url(#dataFill)"
        stroke={color.stroke}
        strokeWidth="2"
        filter="url(#glow)"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill={color.stroke}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1"
        />
      ))}

      {/* Labels */}
      {labelPositions.map((lp) => (
        <g key={lp.key}>
          <text
            x={lp.x}
            y={lp.y - 5}
            textAnchor="middle"
            className="fill-chrome-400"
            style={{
              fontSize: '8px',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {lp.short}
          </text>
          <text
            x={lp.x}
            y={lp.y + 7}
            textAnchor="middle"
            className="fill-chrome-200"
            style={{
              fontSize: '11px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: '700',
            }}
          >
            {lp.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatBar({
  label,
  value,
  max = 5,
  color,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-chrome-400 text-[10px] uppercase tracking-wider font-heading w-20 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-vault-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      <span className="text-xs font-heading w-6 text-right" style={{color}}>
        {value}
      </span>
    </div>
  );
}

export function PerformanceChart({
  stats,
  staminaRange,
  beybladeType,
}: PerformanceChartProps) {
  const color = (beybladeType && TYPE_COLORS[beybladeType]) || DEFAULT_COLOR;

  return (
    <div className="border-t border-vault-700 pt-6 mt-6">
      <h2 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-5">
        Performance Analysis
      </h2>

      <div className="bg-vault-800/50 border border-vault-700 rounded-xl p-5">
        {/* Radar Chart */}
        <RadarChart stats={stats} beybladeType={beybladeType} />

        {/* Stat Bars */}
        <div className="space-y-2.5 mt-4">
          {LABELS.map((l) => (
            <StatBar
              key={l.key}
              label={l.label}
              value={stats[l.key]}
              color={color.stroke}
            />
          ))}
        </div>

        {/* Stamina data callout */}
        {staminaRange && (
          <div className="mt-4 pt-3 border-t border-vault-700/50 flex items-center gap-2">
            <span className="text-chrome-600 text-[10px] uppercase tracking-wider">
              Measured Spin Time
            </span>
            <span
              className="text-xs font-heading font-bold ml-auto"
              style={{color: color.stroke}}
            >
              {staminaRange}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
