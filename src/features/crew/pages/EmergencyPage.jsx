import clsx from 'clsx'
import FaceImage from '@/shared/components/FaceImage'
import { Check, ChevronRight, Pause, Play, Plus, RotateCcw, SatelliteDish } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '../components/ui'
import { useCrew } from '../context/crewContext'

const STEPS = [
  'Secure the crew member and alert the crew',
  'Check responsiveness and breathing',
  'Prepare the onboard defibrillator',
  'Start CPR if not breathing',
]

const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`

/** Emergencia médica (Livorbit): protocolo de ejemplo y temporizador de RCP. */
export default function EmergencyPage() {
  const { crew, showToast } = useCrew()
  const [patient, setPatient] = useState(null)
  const [done, setDone] = useState(() => new Set())
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const toggleStep = (i) =>
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section className="animate-fade-in space-y-4">
      <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-200">Emergency</span>
      </nav>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border-[1.5px] border-critical bg-critical/10 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-critical">
          <Plus className="h-7 w-7 text-white" strokeWidth={3} aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-red-300">Medical emergency</h2>
          <p className="text-xs text-slate-400">Example protocol · medication doses are never given</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {crew.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPatient(c.id)}
            className={clsx(
              'flex items-center gap-2 rounded-full border-[1.5px] py-1 pl-1 pr-3 text-xs font-semibold transition',
              patient === c.id ? 'border-critical bg-critical/20 text-white' : 'border-line bg-panel text-slate-300 hover:border-critical/60',
            )}
          >
            <FaceImage person={c} className="h-6 w-6 rounded-full object-cover" />
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <h3 className="mb-3 text-sm font-bold text-white">Steps</h3>
          <ol className="space-y-2">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => toggleStep(i)}
                  aria-pressed={done.has(i)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg border-[1.5px] px-3 py-2.5 text-left text-sm transition',
                    done.has(i) ? 'border-lime/60 bg-lime/10 text-slate-300 line-through' : 'border-line bg-void text-slate-100 hover:border-cyan/60',
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] font-mono text-xs font-bold',
                      done.has(i) ? 'border-lime bg-lime text-void' : 'border-line text-slate-400',
                    )}
                  >
                    {done.has(i) ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : i + 1}
                  </span>
                  {s}
                </button>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-white">CPR timer</h3>
          <div className="my-4 font-mono text-6xl font-bold tabular-nums text-white">{mmss(seconds)}</div>
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => setRunning((v) => !v)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-critical px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {running ? 'Pause' : seconds ? 'Resume' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false)
                setSeconds(0)
              }}
              aria-label="Reset timer"
              className="rounded-lg border-[1.5px] border-line px-3 text-slate-300 transition hover:border-cyan hover:text-cyan"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => showToast('Alert sent to Earth · ~14 min delay')}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-cyan bg-cobalt/35 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cobalt/55"
          >
            <SatelliteDish className="h-4 w-4" aria-hidden /> Notify Earth
          </button>
        </Panel>
      </div>
    </section>
  )
}
