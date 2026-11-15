import { ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { CrewChart, Sparkline } from '../components/charts'
import EcgStrip from '../components/EcgStrip'
import FatigueTestCard from '../components/FatigueTestCard'
import { Panel, StatusTag } from '../components/ui'
import { CREW_COLORS, MODULE_BY_KEY, formatValue } from '../config/modules'
import { statusOf } from '../config/status'
import { useCrew } from '../context/crewContext'
import { worstModuleLevel } from '../lib/crewModel'

/** Vista de un módulo: comparación de toda la tripulación (Livorbit /mod/:k). */
export default function ModulePage() {
  const { moduleKey } = useParams()
  const { crew } = useCrew()
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(() => new Set())
  const mod = MODULE_BY_KEY[moduleKey]

  if (!mod) return <Navigate to="/" replace />
  const Icon = mod.icon
  const sorted = crew.slice().sort((a, b) => b.modules[mod.key].st - a.modules[mod.key].st)

  const toggle = (id) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section className="animate-fade-in space-y-4">
      <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-200">{mod.name}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-cyan bg-panel p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border-[1.5px] border-cyan/60 bg-cyan/10">
            <Icon className="h-6 w-6 text-cyan" aria-hidden />
          </span>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Biomedical module</span>
            <h2 className="text-lg font-extrabold text-white">{mod.name}</h2>
            <p className="text-xs text-slate-300">{mod.metric} · whole-crew comparison</p>
          </div>
        </div>
        <StatusTag level={worstModuleLevel(crew, mod.key)} />
      </div>

      {mod.key === 'fat' && <FatigueTestCard />}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sorted.map((c) => {
          const d = c.modules[mod.key]
          const st = statusOf(d.st)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/ast/${c.id}`)}
              className="rounded-xl border-[1.5px] bg-panel p-3.5 text-left transition hover:-translate-y-0.5"
              style={{ borderColor: d.st === 0 ? '#24304A' : st.hex }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <img src={c.image} alt="" className="h-7 w-7 rounded-md object-cover" />
                  <span className="truncate text-sm font-bold text-white">{c.name}</span>
                </span>
                <StatusTag level={d.st} short />
              </div>
              {mod.key === 'cardio' && (
                <EcgStrip
                  bpm={d.v}
                  color={d.st < 0 ? '#38FEDC' : st.hex}
                  lost={d.st < 0}
                  grid
                  className="mt-2 h-14 w-full rounded-lg border border-line bg-void"
                />
              )}
              <div className="my-2 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold text-white">{formatValue(d.v, mod.d)}</span>
                <span className="text-xs text-slate-400">{mod.unit}</span>
              </div>
              <Sparkline mod={mod} series={d.series} level={d.st} />
              <p className="mt-1 text-[11.5px]" style={{ color: d.st === 0 ? '#94A3B8' : st.fg }}>
                {d.why}
              </p>
            </button>
          )
        })}
      </div>

      <Panel>
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <h3 className="text-sm font-bold text-white">Crew comparison · 7 days</h3>
          <span className="text-[11px] text-slate-400">Tap a name to hide or show it</span>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {crew.map((c, j) => {
            const color = CREW_COLORS[j % CREW_COLORS.length]
            const on = !hidden.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={on}
                className={clsx('rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition', !on && 'text-slate-400')}
                style={on ? { backgroundColor: color, borderColor: color, color: '#090D16' } : { borderColor: '#24304A' }}
              >
                {c.name}
              </button>
            )
          })}
        </div>
        <CrewChart mod={mod} crew={crew} hidden={hidden} />
      </Panel>

      <Panel>
        <h3 className="mb-2 text-sm font-bold text-white">Module recommendations</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-300">
          {mod.todo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <details className="mt-3 rounded-lg border border-line bg-void px-3 py-2.5 text-sm text-slate-400">
          <summary className="flex cursor-pointer items-center gap-1.5 text-slate-200">
            <Info className="h-4 w-4 text-cyan" aria-hidden /> What it is and why it matters in space
          </summary>
          <p className="mt-2">{mod.info}</p>
          <p className="mt-1">
            NASA HRP risk: <b className="text-slate-200">{mod.hrp}</b>
          </p>
        </details>
      </Panel>
    </section>
  )
}
