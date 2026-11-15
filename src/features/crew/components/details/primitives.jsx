import clsx from 'clsx'
import { fill, ink } from './colors'

const ORANGE = '#FF8A3D'

/** Tarjeta del panel de detalle (dc). Con nivel > 0 se resalta con el color del estado. */
export function DashCard({ title, extra, level = 0, wide = false, children }) {
  const hl = level !== 0
  const c = fill(level)
  return (
    <div
      className={clsx('min-w-0 rounded-xl border-[1.5px] p-3.5', wide && 'lg:col-span-2')}
      style={
        hl
          ? { borderColor: `${c}aa`, background: `linear-gradient(${c}14, ${c}14), #0B101B`, boxShadow: `0 6px 22px ${c}22` }
          : { borderColor: '#24304A', background: '#0B101B' }
      }
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
        <span>{title}</span>
        {extra}
      </div>
      {children}
    </div>
  )
}

/** Rejilla de tarjetas del detalle (dash). */
export const DashGrid = ({ children }) => <div className="my-3 grid grid-cols-1 gap-3 lg:grid-cols-2">{children}</div>

export function Pill({ level = 0, children }) {
  const c = fill(level)
  return (
    <span
      className="inline-block whitespace-nowrap rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
      style={{ borderColor: c, color: ink(level), backgroundColor: `${c}24` }}
    >
      {children}
    </span>
  )
}

/** Número grande en monoespaciada con unidad. */
export function Digits({ value, unit, level, size = 'text-4xl' }) {
  return (
    <div className={clsx('font-mono font-bold leading-none tracking-tight', size)} style={level != null ? { color: ink(level) } : undefined}>
      {value}
      {unit && <span className="ml-1.5 font-sans text-sm font-normal text-slate-400">{unit}</span>}
    </div>
  )
}

export const Muted = ({ children, className }) => <div className={clsx('text-[11.5px] text-slate-400', className)}>{children}</div>

/** Arco de 270° con contenido central. */
export function Arc270({ pct, level, size = 130, children }) {
  const r = 52
  const C = 2 * Math.PI * r
  const L = C * 0.75
  const p = Math.max(0, Math.min(1, pct))
  return (
    <svg viewBox="0 0 130 130" width={size} height={size} className="shrink-0" aria-hidden>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#24304A" strokeWidth="12" strokeDasharray={`${L} ${C}`} transform="rotate(135 65 65)" strokeLinecap="round" />
      <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke={fill(level)}
        strokeWidth="12"
        strokeDasharray={`${L * p} ${C}`}
        transform="rotate(135 65 65)"
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .8s ease-out' }}
      />
      {children}
    </svg>
  )
}

/** Barra segmentada normal → muy alta con marcador. */
export function SegBar({ pct, labels }) {
  const p = Math.max(0, Math.min(1, pct))
  return (
    <>
      <div className="relative mt-2.5 flex h-3 gap-[3px]">
        {[fill(0), fill(1), ORANGE, fill(2)].map((c) => (
          <i key={c} className="flex-1 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <b
          className="absolute -top-1.5 h-6 w-1 -translate-x-0.5 rounded-sm bg-slate-100"
          style={{ left: `${p * 100}%`, boxShadow: '0 0 0 2px #0B101B' }}
        />
      </div>
      {labels && (
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </>
  )
}

/** Barra horizontal con etiqueta y valor. */
export function HBar({ pct, level, label, value }) {
  return (
    <div className="my-1.5">
      <div className="flex justify-between text-[11.5px] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-100">{value}</span>
      </div>
      <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-panel">
        <i
          className="block h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.max(2, Math.min(100, pct * 100))}%`, backgroundColor: fill(level) }}
        />
      </div>
    </div>
  )
}

/** Área con banda de normalidad opcional. */
export function AreaChart({ values, level, w = 300, h = 90, lo, hi }) {
  const mn = Math.min(...values, lo ?? 1e9) - 1
  const mx = Math.max(...values, hi ?? -1e9) + 1
  const n = values.length
  const px = (i) => (i * w) / (n - 1)
  const py = (v) => h - 4 - ((v - mn) / (mx - mn)) * (h - 8)
  const pts = values.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  const c = fill(level)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden>
      {lo != null && <rect x="0" y={py(hi)} width={w} height={py(lo) - py(hi)} fill={fill(0)} fillOpacity="0.1" />}
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={c} fillOpacity="0.18" />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Onda pletismográfica (SpO₂) desplazándose al ritmo del pulso. */
export function Pleth({ level, bpm }) {
  let d = ''
  for (let k = 0; k < 9; k += 1) {
    const o = k * 100
    d += `${k ? 'L' : 'M'}${o} 66 C${o + 12} 66 ${o + 18} 10 ${o + 32} 12 C${o + 44} 14 ${o + 46} 40 ${o + 54} 42 C${o + 60} 44 ${o + 62} 32 ${o + 70} 36 C${o + 80} 42 ${o + 90} 66 ${o + 100} 66 `
  }
  return (
    <div className="relative h-20 overflow-hidden">
      <svg viewBox="0 0 800 80" preserveAspectRatio="none" className="absolute left-0 top-0 h-full w-[200%]" aria-hidden>
        <g style={{ animation: `pleth-scroll ${(60 / (bpm || 70)).toFixed(3)}s linear infinite` }}>
          <path d={d} fill="none" stroke={fill(level)} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  )
}

/** Medidor semicircular (presión sistólica) con zonas verde/ámbar/rojo. */
export function SemiGauge({ value, max, zones, text, label }) {
  const R = 90
  const cx = 110
  const cy = 105
  const ang = (x) => Math.PI * (1 - Math.min(x, max) / max)
  const P = (x) => [cx + R * Math.cos(ang(x)), cy - R * Math.sin(ang(x))]
  const arc = (a, b, c) => {
    const [p1, p2] = [P(a), P(b)]
    return <path key={c} d={`M${p1[0]} ${p1[1]} A${R} ${R} 0 0 1 ${p2[0]} ${p2[1]}`} stroke={c} strokeWidth="16" fill="none" />
  }
  const deg = (Math.min(value, max) / max) * 180 - 90
  return (
    <svg viewBox="0 0 220 135" width="100%" className="max-w-[220px] shrink-0" role="img" aria-label={label}>
      {arc(0, zones[0], fill(0))}
      {arc(zones[0], zones[1], fill(1))}
      {arc(zones[1], max, fill(2))}
      <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1.2s cubic-bezier(.3,1.4,.5,1)' }}>
        <line x1={cx} y1={cy} x2={cx} y2={cy - R + 8} stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r="7" fill="#F1F5F9" />
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize="18" fontWeight="700" fill="#F1F5F9">
        {text}
      </text>
      <text x="20" y={cy + 14} fontSize="10" fill="#94A3B8">
        0
      </text>
      <text x="200" y={cy + 14} textAnchor="end" fontSize="10" fill="#94A3B8">
        {max}
      </text>
    </svg>
  )
}

/** Barras verticales con tooltip nativo. items: [{ v, level, tip }] */
export function VBars({ items, scale }) {
  return (
    <div className="flex h-[100px] flex-1 items-end gap-1">
      {items.map((it, i) => (
        <i
          key={i}
          title={it.tip}
          className="flex-1 rounded-t-sm transition-opacity hover:opacity-70"
          style={{ height: `${Math.max(10, it.v * scale)}px`, backgroundColor: fill(it.level) }}
        />
      ))}
    </div>
  )
}
