import clsx from 'clsx'
import { RotateCw, SatelliteDish } from 'lucide-react'
import { useState } from 'react'
import { useCrew } from '../../context/crewContext'
import { formatValue } from '../../config/modules'
import { statusOf } from '../../config/status'
import { Heart, StatusTag } from '../ui'
import ActivityDetail from './ActivityDetail'
import CardioDetail from './CardioDetail'
import FatigueDetail from './FatigueDetail'
import ImmuneDetail from './ImmuneDetail'
import RadiationDetail from './RadiationDetail'
import { fill, ink } from './colors'

/** Vista de detalle de cada módulo (space-qhealth v31). Las claves están en DETAIL_MODULES. */
const DETAIL_VIEWS = { cardio: CardioDetail, rad: RadiationDetail, inm: ImmuneDetail, fat: FatigueDetail, act: ActivityDetail }

/** Tendencia de 7 o 30 días con la banda de "su normal" (media ± 2 sd). */
function TrendChart({ mod, series, w = 1100, h = 220 }) {
  const n = series.length
  const lo = mod.b - 2 * mod.sd
  const hi = mod.b + 2 * mod.sd
  const sv = series.filter((v) => v != null)
  const mn = Math.min(lo, ...sv) - mod.sd * 0.6
  const mx = Math.max(hi, ...sv) + mod.sd * 0.6
  const px = (i) => 40 + (i * (w - 60)) / (n - 1)
  const py = (v) => h - 28 - ((v - mn) / (mx - mn)) * (h - 44)
  const lab = (i) => (i === n - 1 ? 'Today' : `D-${n - 1 - i}`)
  const every = n > 10 ? 5 : 1
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={`${n}-day trend`}>
      <rect x="40" y={py(hi)} width={w - 60} height={py(lo) - py(hi)} fill={fill(0)} fillOpacity="0.12" stroke={fill(0)} strokeOpacity="0.4" strokeDasharray="4 4" />
      <text x={w - 22} y={py(hi) - 5} textAnchor="end" fontSize="11" fill="#94A3B8">
        their normal
      </text>
      <polyline
        points={series.map((v, i) => (v == null ? '' : `${px(i)},${py(v)}`)).join(' ')}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {series.map((v, i) => (
        <g key={i}>
          {(n - 1 - i) % every === 0 && (
            <text x={px(i)} y={h - 8} textAnchor="middle" fontSize="11" fill="#94A3B8">
              {lab(i)}
            </text>
          )}
          {v == null ? (
            <text x={px(i)} y={h / 2} textAnchor="end" fontSize="12" fill="#38FEDC">
              no data
            </text>
          ) : (
            <circle cx={px(i)} cy={py(v)} r={i === n - 1 ? 6 : n > 10 ? 3 : 4} fill={v < lo || v > hi ? fill(2) : fill(0)} stroke="#111726" strokeWidth="2">
              <title>{`${lab(i)}: ${formatValue(v, mod.d)} ${mod.unit}${v < lo || v > hi ? ' · outside their normal' : ''}`}</title>
            </circle>
          )}
        </g>
      ))}
    </svg>
  )
}

/** Vista de detalle de un módulo para una persona (vDet del ejemplo). */
export default function ModuleDetail({ member, mod }) {
  const { showToast } = useCrew()
  const [range, setRange] = useState(7)
  const d = member.modules[mod.key]
  const st = statusOf(d.st)
  const Icon = mod.icon
  const Detail = DETAIL_VIEWS[mod.key]
  const sensor = d.st < 0

  const remeasure = () => {
    showToast('Measuring…')
    setTimeout(() => showToast(`New reading: ${formatValue(d.v, mod.d)} ${mod.unit}`), 900)
  }

  return (
    <section className="animate-fade-in rounded-xl border-[1.5px] bg-panel p-4" style={{ borderColor: d.st === 0 ? '#24304A' : st.hex }}>
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-extrabold text-white">
          {mod.name} · {member.name}
        </h3>
        <span className="ml-auto">
          <StatusTag level={d.st} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {mod.key === 'cardio' ? (
          <Heart bpm={sensor ? 0 : d.v} className="h-11 w-11" />
        ) : (
          <Icon className="h-8 w-8 text-cyan" aria-hidden />
        )}
        <span className="font-mono text-4xl font-bold text-white">{formatValue(d.v, mod.d)}</span>
        <span className="text-sm text-slate-400">
          {mod.unit} · {mod.metric}
        </span>
        <span className="ml-auto text-xs text-slate-400">
          Their normal: {formatValue(mod.b - 2 * mod.sd, mod.d)}–{formatValue(mod.b + 2 * mod.sd, mod.d)} {mod.unit}
        </span>
      </div>

      <Detail member={member} />

      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-slate-400">Trend</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-line">
          {[7, 30].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRange(n)}
              className={clsx('px-3 py-1.5 text-xs transition', range === n ? 'bg-cyan font-bold text-void' : 'bg-panel text-slate-400 hover:text-slate-200')}
            >
              {n} days
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">Hover the chart for detail</span>
      </div>
      <TrendChart mod={mod} series={range === 30 ? d.month : d.series} />

      <div className="my-2.5 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: st.hex, background: `linear-gradient(${st.hex}1f, ${st.hex}1f), #0B101B` }}>
        <b style={{ color: ink(d.st) }}>Why:</b> <span className="text-slate-200">{d.why}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={remeasure}
          className="inline-flex min-w-[130px] flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan"
        >
          <RotateCw className="h-4 w-4" aria-hidden /> Measure again
        </button>
        {sensor ? (
          <button
            type="button"
            disabled
            title="A sensor failure is not reported as a clinical alert"
            className="inline-flex min-w-[130px] flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-3 py-2 text-xs font-semibold text-slate-500"
          >
            No Earth notice
          </button>
        ) : (
          <button
            type="button"
            onClick={() => showToast('Message queued for Earth · arrives in ~14 min')}
            className="inline-flex min-w-[130px] flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-3 py-2 text-xs font-bold text-white transition hover:bg-cobalt/60"
          >
            <SatelliteDish className="h-4 w-4" aria-hidden /> Notify Earth
          </button>
        )}
      </div>
    </section>
  )
}
