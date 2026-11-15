import { BellRing, Check, Info, SatelliteDish, X } from 'lucide-react'
import { useEffect } from 'react'
import { statusOf } from '../config/status'
import { StatusTag } from './ui'

/**
 * Notificación modal con las recomendaciones de un módulo. Se abre con el botón "Recommendations"
 * de la cabecera del módulo. flagged: tripulantes con el módulo fuera de su normal.
 */
export default function RecommendationsModal({ mod, level, flagged, personName, onClose, onNotifyEarth }) {
  const st = statusOf(level)
  const Icon = mod.icon
  const alert = level > 0

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="recs-title"
        className="max-h-[88vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-2xl border-[1.5px] bg-panel shadow-[0_20px_60px_rgb(0_0_0/0.7)]"
        style={{ borderColor: st.hex, boxShadow: `0 0 0 1px ${st.hex}33, 0 0 40px ${st.hex}33, 0 20px 60px rgb(0 0 0 / 0.7)` }}
      >
        {/* Cabecera */}
        <div className="flex items-start gap-3 border-b border-line p-4" style={{ background: `linear-gradient(${st.hex}18, ${st.hex}08)` }}>
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1.5px]" style={{ borderColor: st.hex }}>
            {alert && <span className="absolute inset-0 animate-ping rounded-xl border-2 opacity-40" style={{ borderColor: st.hex }} />}
            <Icon className="h-6 w-6" style={{ color: st.fg }} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: st.fg }}>
              <BellRing className="h-3.5 w-3.5" aria-hidden /> Module recommendations
            </p>
            <h2 id="recs-title" className="text-lg font-extrabold text-white">
              {mod.name}
            </h2>
            <p className="text-xs text-slate-400">
              {personName
                ? `${personName} is ${alert ? 'outside' : 'within'} their normal range`
                : alert
                  ? `${flagged.length} crew member${flagged.length > 1 ? 's' : ''} outside their normal range`
                  : 'All crew members within their normal range'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusTag level={level} short />
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {flagged.length > 0 && (
            <section>
              <h3 className="mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">Needs attention</h3>
              <ul className="space-y-1.5">
                {flagged.map((c) => {
                  const d = c.modules[mod.key]
                  const s = statusOf(d.st)
                  return (
                    <li key={c.id} className="flex items-start gap-2.5 rounded-lg border bg-void p-2" style={{ borderColor: `${s.hex}66` }}>
                      <img src={c.image} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                          {c.name}
                          <StatusTag level={d.st} short />
                        </p>
                        <p className="text-[11.5px]" style={{ color: s.fg }}>
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
            <h3 className="mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">What to do</h3>
            <ol className="space-y-1.5">
              {mod.todo.map((t, i) => (
                <li key={t} className="flex items-center gap-2.5 rounded-lg border border-line bg-void px-3 py-2 text-sm text-slate-100">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold"
                    style={{ backgroundColor: i === 0 && alert ? st.hex : '#24304A', color: i === 0 && alert ? '#090D16' : '#CBD5E1' }}
                  >
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </section>

          <details className="rounded-lg border border-line bg-void px-3 py-2.5 text-sm text-slate-400">
            <summary className="flex cursor-pointer items-center gap-1.5 text-slate-200">
              <Info className="h-4 w-4 text-cyan" aria-hidden /> What it is and why it matters in space
            </summary>
            <p className="mt-2">{mod.info}</p>
            <p className="mt-1">
              NASA HRP risk: <b className="text-slate-200">{mod.hrp}</b>
            </p>
          </details>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line p-4">
          {alert && (
            <button
              type="button"
              onClick={onNotifyEarth}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan"
            >
              <SatelliteDish className="h-4 w-4" aria-hidden /> Notify Earth
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-cobalt/60"
          >
            <Check className="h-4 w-4" aria-hidden /> Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}
