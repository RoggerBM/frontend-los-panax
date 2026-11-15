import { Palette, Play, ScanFace, Timer, TrafficCone, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VerdictBadge } from '@/features/cognitive'
import { useCrew } from '../context/crewContext'

const PARTS = [
  { icon: ScanFace, label: 'Face scan', hint: 'Biometric validation before the test' },
  { icon: Zap, label: 'PVT', hint: 'Simple reaction' },
  { icon: TrafficCone, label: 'Go/No-Go', hint: 'Impulse control' },
  { icon: Palette, label: 'Stroop', hint: 'Cognitive control' },
]

const fmtTime = (at) => (at ? new Date(at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
const ms = (v) => (v == null ? '—' : `${Math.round(v)} ms`)

/** Acceso al test de fatiga desde el módulo Fatigue & Sleep, con el último resultado de cada tripulante. */
export default function FatigueTestCard() {
  const navigate = useNavigate()
  const { crew } = useCrew()

  return (
    <section className="rounded-xl border-[1.5px] border-cyan/70 bg-[linear-gradient(135deg,#143238_0%,#111726_60%)] p-4 shadow-[0_0_18px_rgb(56_254_220/0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Fatigue test</span>
          <h3 className="text-base font-extrabold text-white">Estimate reaction times</h3>
          <p className="mt-0.5 text-xs text-slate-300">
            A face scan confirms who is taking it, then three short blocks run back to back. The result updates that crew
            member&apos;s PVT.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PARTS.map((part) => {
              const PartIcon = part.icon
              return (
                <span
                  key={part.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-void px-2 py-1 text-[11px] text-slate-300"
                  title={part.hint}
                >
                  <PartIcon className="h-3.5 w-3.5 text-cyan" aria-hidden />
                  {part.label}
                </span>
              )
            })}
            <span className="inline-flex items-center gap-1 px-1 text-[11px] text-slate-400">
              <Timer className="h-3.5 w-3.5" aria-hidden /> ≈ 1 min
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/mod/fat/test')}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-cobalt/60"
        >
          <Play className="h-4 w-4" aria-hidden /> Start fatigue test
        </button>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">Last result per crew member</p>
        <ul className="grid gap-2 md:grid-cols-2">
          {crew.map((c) => {
            const t = c.lastTest
            return (
              <li key={c.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-void p-2">
                <img src={c.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-100">{c.name}</p>
                  <p className="font-mono text-[10.5px] text-slate-400">
                    {t ? `PVT ${ms(t.times?.reaction)} · ${fmtTime(t.at)}` : 'No test yet'}
                  </p>
                </div>
                {t ? (
                  <div className="w-[150px] shrink-0">
                    <VerdictBadge verdict={t.verdict} compact />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/mod/fat/test?crew=${c.id}`)}
                    className="shrink-0 rounded-md border border-cyan/60 px-2.5 py-1 text-[11px] font-semibold text-cyan transition hover:bg-cyan/10"
                  >
                    Take test
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
