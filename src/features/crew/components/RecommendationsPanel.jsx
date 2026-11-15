import { BellRing, Info, SatelliteDish } from 'lucide-react'
import { statusOf } from '../config/status'
import { StatusTag } from './ui'

/**
 * Columna de recomendaciones (30 % de la pantalla) de un módulo.
 * flagged: tripulantes con el módulo fuera de su normal · personName: vista de una sola persona.
 */
export default function RecommendationsPanel({ mod, level, flagged, personName, onNotifyEarth }) {
  const st = statusOf(level)
  const Icon = mod.icon
  const alert = level > 0

  return (
    <aside
      aria-label="Module recommendations"
      className="overflow-hidden rounded-xl border-[1.5px] bg-panel xl:sticky xl:top-28"
      style={{ borderColor: st.hex, boxShadow: alert ? `0 0 26px ${st.hex}26` : undefined }}
    >
      <div className="flex items-start gap-3 border-b border-line p-3.5" style={{ background: `linear-gradient(${st.hex}18, ${st.hex}08)` }}>
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[1.5px]" style={{ borderColor: st.hex }}>
          {alert && <span className="absolute inset-0 animate-ping rounded-xl border-2 opacity-40" style={{ borderColor: st.hex }} />}
          <Icon className="h-5 w-5" style={{ color: st.fg }} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: st.fg }}>
            <BellRing className="h-3.5 w-3.5" aria-hidden /> Recommendations
          </p>
          <h2 className="text-base font-extrabold text-white">{mod.name}</h2>
          <p className="text-[11.5px] text-slate-400">
            {personName
              ? `${personName} is ${alert ? 'outside' : 'within'} their normal range`
              : alert
                ? `${flagged.length} crew member${flagged.length > 1 ? 's' : ''} outside their normal range`
                : 'All crew members within their normal range'}
          </p>
        </div>
        <StatusTag level={level} short />
      </div>

      <div className="space-y-3.5 p-3.5">
        {flagged.length > 0 && (
          <section>
            <h3 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Needs attention</h3>
            <ul className="space-y-1.5">
              {flagged.map((c) => {
                const d = c.modules[mod.key]
                const s = statusOf(d.st)
                return (
                  <li key={c.id} className="flex items-start gap-2 rounded-lg border bg-void p-2" style={{ borderColor: `${s.hex}66` }}>
                    <img src={c.image} alt="" className="h-7 w-7 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                        <span className="truncate">{c.name}</span>
                        <StatusTag level={d.st} short />
                      </p>
                      <p className="text-[11px] leading-snug" style={{ color: s.fg }}>
                        {d.why}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">What to do</h3>
          <ol className="space-y-1.5">
            {mod.todo.map((t, i) => (
              <li key={t} className="flex items-start gap-2 rounded-lg border border-line bg-void px-2.5 py-2 text-[12.5px] text-slate-100">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold"
                  style={{ backgroundColor: i === 0 && alert ? st.hex : '#24304A', color: i === 0 && alert ? '#090D16' : '#CBD5E1' }}
                >
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <p className="mt-1.5 text-[11px] text-slate-500">Medication doses are never given.</p>
        </section>

        <details className="rounded-lg border border-line bg-void px-3 py-2 text-[12.5px] text-slate-400">
          <summary className="flex cursor-pointer items-center gap-1.5 text-slate-200">
            <Info className="h-4 w-4 text-cyan" aria-hidden /> What it is and why it matters in space
          </summary>
          <p className="mt-2">{mod.info}</p>
          <p className="mt-1">
            NASA HRP risk: <b className="text-slate-200">{mod.hrp}</b>
          </p>
        </details>

        {alert && (
          <button
            type="button"
            onClick={onNotifyEarth}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cobalt/60"
          >
            <SatelliteDish className="h-4 w-4" aria-hidden /> Notify Earth
          </button>
        )}
      </div>
    </aside>
  )
}
