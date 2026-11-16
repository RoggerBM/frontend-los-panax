import clsx from 'clsx'
import FaceImage from '@/shared/components/FaceImage'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { NutritionPanel } from '@/features/nutrition'
import { CrewChart, Sparkline } from '../components/charts'
import ModuleDetail from '../components/details/ModuleDetail'
import EcgStrip from '../components/EcgStrip'
import FatigueTestCard from '../components/FatigueTestCard'
import RecommendationsPanel from '../components/RecommendationsPanel'
import { Panel, StatusDot, StatusTag } from '../components/ui'
import { CREW_COLORS, DETAIL_MODULES, MODULES, MODULE_BY_KEY, formatValue } from '../config/modules'
import { statusOf } from '../config/status'
import { useCrew } from '../context/crewContext'
import { worstModuleLevel } from '../lib/crewModel'

const chipCls = (on) =>
  clsx(
    'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition',
    on ? 'border-cyan bg-cyan text-void' : 'border-line bg-panel text-slate-300 hover:border-cyan/60',
  )

/**
 * Vista de un módulo: contenido al 70 % y recomendaciones al 30 %.
 * - /mod/:k → toda la tripulación. En los módulos con detalle (v31) se elige a quién ver.
 * - /mod/:k?crew=<id> → solo los datos de esa persona (se abre desde su ficha, sin comparar con otros).
 */
export default function ModulePage() {
  const { moduleKey } = useParams()
  const [params] = useSearchParams()
  const { crew, getMember, showToast } = useCrew()
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(() => new Set())
  const [pickedId, setPickedId] = useState(null)
  const mod = MODULE_BY_KEY[moduleKey]
  const focus = getMember(params.get('crew') ?? '')

  if (!mod) return <Navigate to="/" replace />
  const Icon = mod.icon
  const people = focus ? [focus] : crew
  const level = worstModuleLevel(people, mod.key)
  const sorted = people.slice().sort((a, b) => b.modules[mod.key].st - a.modules[mod.key].st)
  const flagged = sorted.filter((c) => c.modules[mod.key].st !== 0)
  const hasDetail = DETAIL_MODULES.has(mod.key)
  // Persona del detalle: la de la ficha, la elegida o, por defecto, la que está peor
  const person = focus ?? getMember(pickedId ?? '') ?? sorted[0]

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
        {focus && (
          <>
            <Link to={`/ast/${focus.id}`} className="hover:text-cyan">
              {focus.name}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
          </>
        )}
        <span className="text-slate-200">{mod.name}</span>
      </nav>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {/* 70 %: contenido del módulo */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-cyan bg-panel p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border-[1.5px] border-cyan/60 bg-cyan/10">
                <Icon className="h-6 w-6 text-cyan" aria-hidden />
              </span>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Biomedical module</span>
                <h2 className="text-lg font-extrabold text-white">{mod.name}</h2>
                <p className="text-xs text-slate-300">
                  {mod.metric} · {focus ? focus.name : 'whole-crew comparison'}
                </p>
              </div>
            </div>
            <StatusTag level={level} />
          </div>

          {mod.key === 'fat' && <FatigueTestCard members={people} />}

          {mod.key === 'nut' && (
            <section className="rounded-xl border-[1.5px] border-cyan/60 bg-[linear-gradient(135deg,#143238_0%,#0B101B_55%)] p-4">
              <NutritionPanel key={focus?.id ?? 'all'} crew={people} onlyId={focus?.id} onToast={showToast} />
            </section>
          )}

          {hasDetail ? (
            <>
              {focus ? (
                // Cambiar de módulo sin salir de la persona
                <div className="flex flex-wrap gap-1.5">
                  {MODULES.map((x) => {
                    const XIcon = x.icon
                    return (
                      <button key={x.key} type="button" onClick={() => navigate(`/mod/${x.key}?crew=${focus.id}`)} className={chipCls(x.key === mod.key)}>
                        <StatusDot level={focus.modules[x.key].st} />
                        <XIcon className="h-3.5 w-3.5" aria-hidden />
                        {x.name}
                      </button>
                    )
                  })}
                </div>
              ) : (
                // Elegir de quién ver el detalle
                <div className="flex flex-wrap gap-1.5">
                  {sorted.map((c) => (
                    <button key={c.id} type="button" onClick={() => setPickedId(c.id)} className={chipCls(c.id === person.id)}>
                      <StatusDot level={c.modules[mod.key].st} />
                      {c.name.split(' ')[0]} · {statusOf(c.modules[mod.key].st).label}
                    </button>
                  ))}
                </div>
              )}
              <ModuleDetail key={`${person.id}:${mod.key}`} member={person} mod={mod} />
            </>
          ) : (
            <>
              <div className={clsx('grid grid-cols-1 gap-3', !focus && 'md:grid-cols-2')}>
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
                          <FaceImage person={c} className="h-7 w-7 rounded-md object-cover" />
                          <span className="truncate text-sm font-bold text-white">{c.name}</span>
                        </span>
                        <StatusTag level={d.st} short />
                      </div>
                      {mod.key === 'cardio' && (
                        <EcgStrip bpm={d.v} color={d.st < 0 ? '#38FEDC' : st.hex} lost={d.st < 0} grid className="mt-2 h-14 w-full rounded-lg border border-line bg-void" />
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
                {focus ? (
                  <h3 className="mb-2 text-sm font-bold text-white">7-day trend · {focus.name}</h3>
                ) : (
                  <>
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
                  </>
                )}
                <CrewChart mod={mod} crew={people} hidden={focus ? new Set() : hidden} />
              </Panel>
            </>
          )}
        </div>

        {/* 30 %: recomendaciones */}
        <RecommendationsPanel
          mod={mod}
          level={level}
          flagged={flagged}
          personName={focus?.name}
          onNotifyEarth={() => showToast(`${mod.name} recommendations sent to Earth · arrives in ~14 min`)}
        />
      </div>
    </section>
  )
}
