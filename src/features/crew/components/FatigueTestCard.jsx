import { Palette, Play, ScanFace, Timer, TrafficCone, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VerdictBadge } from '@/features/cognitive'
import { useCrew } from '../context/crewContext'
import TestButton from './TestButton'

const PARTS = [
  { icon: ScanFace, label: 'Face scan', hint: 'Biometric validation before the test' },
  { icon: Zap, label: 'PVT', hint: 'Simple reaction' },
  { icon: TrafficCone, label: 'Go/No-Go', hint: 'Impulse control' },
  { icon: Palette, label: 'Stroop', hint: 'Cognitive control' },
]

const fmtTime = (at) => (at ? new Date(at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
const ms = (v) => (v == null ? '—' : `${Math.round(v)} ms`)

/** Acceso al test de fatiga desde el módulo Fatigue & Sleep, con el último resultado de cada tripulante. */
export default function FatigueTestCard({ members }) {
  const navigate = useNavigate()
  const { crew: allCrew } = useCrew()
  // members: limita la tarjeta a esas personas (p. ej. solo el tripulante de la ficha)
  const crew = members ?? allCrew
  const single = crew.length === 1 ? crew[0] : null

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
        <TestButton
          size="lg"
          icon={Play}
          className="shrink-0"
          onClick={() => navigate(single ? `/mod/fat/test?crew=${single.id}` : '/mod/fat/test')}
        >
          Start fatigue test
        </TestButton>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {single ? 'Last result' : 'Last result per crew member'}
        </p>
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
                  <TestButton size="sm" className="shrink-0" onClick={() => navigate(`/mod/fat/test?crew=${c.id}`)}>
                    Take test
                  </TestButton>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
