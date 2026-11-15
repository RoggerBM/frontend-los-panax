import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { formatValue } from '../config/modules'
import { statusOf } from '../config/status'
import { Sparkline } from './charts'
import EcgStrip from './EcgStrip'
import { Heart, StatusDot, StatusTag } from './ui'

/** Tarjeta de un módulo para un tripulante (vista /ast/:id). */
export default function ModuleCard({ mod, data, wide = false, onClick }) {
  const st = statusOf(data.st)
  const Icon = mod.icon
  const alert = data.st !== 0
  const isCardio = mod.key === 'cardio'

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group flex flex-col gap-1 rounded-xl border-[1.5px] bg-panel px-3 py-2.5 text-left transition-all hover:-translate-y-0.5',
        wide && 'sm:col-span-2',
        !alert && 'border-line hover:border-cyan/60',
      )}
      style={
        alert
          ? { borderColor: `${st.hex}aa`, backgroundColor: `${st.hex}10`, boxShadow: `0 6px 22px ${st.hex}22` }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-2 text-[13px] font-bold text-slate-100">
        <span className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-cyan" aria-hidden />
          {mod.name}
        </span>
        {alert ? <StatusTag level={data.st} short /> : <StatusDot level={0} />}
      </div>

      <div className="flex items-center gap-1.5">
        {isCardio && data.st >= 0 && <Heart bpm={data.v} className="h-5 w-5" />}
        <b className="font-mono text-2xl text-white">{formatValue(data.v, mod.d)}</b>
        <span className="text-xs text-slate-400">{mod.unit}</span>
        <span className="ml-auto text-[11px] text-slate-500">{mod.metric}</span>
      </div>

      {isCardio && (
        <EcgStrip
          bpm={data.v}
          color={data.st < 0 ? '#38FEDC' : st.hex}
          lost={data.st < 0}
          grid
          className="my-1 h-16 w-full rounded-lg border border-line bg-void"
        />
      )}

      <Sparkline mod={mod} series={data.series} level={data.st} width={wide ? 560 : 260} />

      {alert && (
        <div className="text-[11.5px] leading-snug" style={{ color: st.fg }}>
          {data.why}
        </div>
      )}
      <div className="flex items-center justify-end gap-0.5 text-[10.5px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
        View module <ChevronRight className="h-3 w-3" aria-hidden />
      </div>
    </button>
  )
}
