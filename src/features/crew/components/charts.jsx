import { CREW_COLORS, formatValue } from '../config/modules'
import { statusOf } from '../config/status'

const LIME = '#50EF39'
const RED = '#C51111'
const dayLabel = (i, n) => (i === n - 1 ? 'Today' : `D-${n - 1 - i}`)

/** Mini tendencia de 7 días con la banda de "su normal" (media ± 2 sd). */
export function Sparkline({ mod, series, level, width = 260, height = 56 }) {
  const n = series.length
  const lo = mod.b - 2 * mod.sd
  const hi = mod.b + 2 * mod.sd
  const vals = series.filter((v) => v != null)
  const mn = Math.min(lo, ...vals) - mod.sd * 0.5
  const mx = Math.max(hi, ...vals) + mod.sd * 0.5
  const px = (i) => 6 + (i * (width - 12)) / (n - 1)
  const py = (v) => height - 6 - ((v - mn) / (mx - mn)) * (height - 12)
  const stroke = level > 0 ? statusOf(level).hex : '#CBD5E1'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden>
      <rect x="0" y={py(hi)} width={width} height={py(lo) - py(hi)} fill={LIME} fillOpacity="0.08" />
      <polyline
        points={series.map((v, i) => (v == null ? '' : `${px(i)},${py(v)}`)).join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {series.map((v, i) => {
        if (v == null) return null
        const out = v < lo || v > hi
        if (i !== n - 1 && !out) return null
        return (
          <circle key={i} cx={px(i)} cy={py(v)} r={i === n - 1 ? 4 : 2.6} fill={out ? RED : LIME}>
            <title>{`${dayLabel(i, n)}: ${formatValue(v, mod.d)} ${mod.unit}`}</title>
          </circle>
        )
      })}
    </svg>
  )
}

/** Comparación de la tripulación en un módulo, 7 días. hidden: Set de ids ocultos. */
export function CrewChart({ mod, crew, hidden, width = 1100, height = 240 }) {
  const n = 7
  const lo = mod.b - 2 * mod.sd
  const hi = mod.b + 2 * mod.sd
  const all = crew.flatMap((c) => c.modules[mod.key].series).filter((v) => v != null)
  const mn = Math.min(lo, ...all) - mod.sd * 0.6
  const mx = Math.max(hi, ...all) + mod.sd * 0.6
  const px = (i) => 48 + (i * (width - 68)) / (n - 1)
  const py = (v) => height - 28 - ((v - mn) / (mx - mn)) * (height - 44)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Crew comparison: ${mod.name}`}>
      <rect
        x="48"
        y={py(hi)}
        width={width - 68}
        height={py(lo) - py(hi)}
        fill={LIME}
        fillOpacity="0.07"
        stroke={LIME}
        strokeOpacity="0.35"
        strokeDasharray="4 4"
      />
      <text x={width - 22} y={py(hi) - 6} textAnchor="end" fontSize="12" fill="#94A3B8">
        their normal
      </text>
      {[mn, (mn + mx) / 2, mx].map((v) => (
        <text key={v} x="40" y={py(v) + 4} textAnchor="end" fontSize="11" fill="#64748B" fontFamily="monospace">
          {formatValue(v, mod.d)}
        </text>
      ))}
      {crew.map((c, j) => {
        if (hidden.has(c.id)) return null
        const s = c.modules[mod.key].series
        const color = CREW_COLORS[j % CREW_COLORS.length]
        return (
          <g key={c.id}>
            <polyline
              points={s.map((v, i) => (v == null ? '' : `${px(i)},${py(v)}`)).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {s.map((v, i) =>
              v == null ? null : (
                <circle key={i} cx={px(i)} cy={py(v)} r={i === n - 1 ? 6 : 3.5} fill={color} stroke="#111726" strokeWidth="1.5">
                  <title>{`${c.name} · ${dayLabel(i, n)}: ${formatValue(v, mod.d)} ${mod.unit}`}</title>
                </circle>
              ),
            )}
          </g>
        )
      })}
      {Array.from({ length: n }, (_, i) => (
        <text key={i} x={px(i)} y={height - 8} textAnchor="middle" fontSize="12" fill="#94A3B8">
          {dayLabel(i, n)}
        </text>
      ))}
    </svg>
  )
}

/** Anillo de progreso con icono SVG central. */
export function GoalRing({ pct, hex, label, value, icon, onClick }) {
  const Icon = icon
  const r = 40
  const C = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, pct))
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label}: ${value}`}
      className="flex flex-col items-center gap-0.5 rounded-xl p-1.5 transition-colors hover:bg-elevated"
    >
      <span className="relative block h-[92px] w-[92px]">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="48" cy="48" r={r} stroke="#24304A" strokeWidth="8" fill="none" />
          <circle
            cx="48"
            cy="48"
            r={r}
            stroke={hex}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <Icon className="absolute inset-0 m-auto h-7 w-7" style={{ color: hex }} strokeWidth={2.2} aria-hidden />
      </span>
      <span className="text-[12px] font-bold text-slate-100">
        {label} · {Math.round(p * 100)} %
      </span>
      <span className="font-mono text-[10.5px] text-slate-400">{value}</span>
    </button>
  )
}
