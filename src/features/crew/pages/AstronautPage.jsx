import { BedDouble, ChevronRight, Dumbbell, GlassWater, MapPin, SatelliteDish, Utensils, Zap } from 'lucide-react'
import { Suspense, lazy, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { GoalRing } from '../components/charts'
import ModuleCard from '../components/ModuleCard'
import TestButton from '../components/TestButton'
import { Heart, Panel, SectionLabel, StatusDot, StatusTag } from '../components/ui'
import { BODY_ZONES, MODULES, formatValue } from '../config/modules'
import { statusOf } from '../config/status'
import { useCrew } from '../context/crewContext'

// El modelo 3D (three.js + malla anatómica) se carga aparte, solo al abrir una ficha
const Body3D = lazy(() => import('../components/Body3D'))

const ringHex = (level) => statusOf(level).hex

// Prioridad clínica de los módulos al decidir cuáles llevan gráfico
const PRIORITY = ['cardio', 'rad', 'fat', 'inm', 'nut', 'con', 'act']
const CHARTED = 3
// Gravedad para ordenar: crítico > revisión > fallo de sensor > nominal
const SEVERITY = { 2: 3, 1: 2, '-1': 1, 0: 0 }

/**
 * Solo los módulos más importantes llevan gráfico: cardiovascular (siempre, lleva el ECG)
 * + los 2 más graves (a igual gravedad, por prioridad clínica). El resto va a una lista compacta.
 */
function splitModules(m) {
  const ranked = PRIORITY.filter((k) => k !== 'cardio')
    .map((k) => MODULES.find((x) => x.key === k))
    .sort((a, b) => SEVERITY[m[b.key].st] - SEVERITY[m[a.key].st] || PRIORITY.indexOf(a.key) - PRIORITY.indexOf(b.key))
  const cardio = MODULES.find((x) => x.key === 'cardio')
  return { charted: [cardio, ...ranked.slice(0, CHARTED - 1)], others: ranked.slice(CHARTED - 1) }
}

function protocolFor(member) {
  const r = member.readings
  if (member.level === 2) {
    return {
      badge: 'ESCALATE TO FLIGHT SURGEON',
      level: 2,
      measure:
        member.location === 'EVA'
          ? 'Check PLSS O₂ reserve, pulse and the T1 thermal sensor at rest.'
          : 'Take BP on the left arm, capillary glucose and a 30-s ECG.',
      action:
        r.dose_msv_day >= 1.5
          ? 'Abort EVA, move into the shielded module and keep the crew in the shelter.'
          : 'Hydrate with 500 ml of electrolytes, assisted rest and isolate the failed sensor.',
      escalate: 'Priority alert to the flight surgeon on Earth with the biometric package.',
    }
  }
  if (member.level === 1) {
    return {
      badge: 'ASYNCHRONOUS REPORT TO EARTH',
      level: 1,
      measure: 'Repeat the BP, glucose and IR temperature readings in 15 min.',
      action: 'Drink 350 ml of water with electrolytes and reduce physical load for 30 min.',
      escalate: 'Log it in the medical record for review by the team on Earth.',
    }
  }
  return {
    badge: 'AUTONOMOUS • NOMINAL',
    level: 0,
    measure: 'Routine morning check of pulse, BP, glucose and hours of sleep.',
    action: 'Keep the ARED routine (45 min) and the 2.5 L hydration target.',
    escalate: 'No escalation required; automatic sync every 6 h.',
  }
}

/** Ficha del tripulante (Livorbit /ast/:id): gemelo 3D, metas y tarjetas de módulos. */
export default function AstronautPage() {
  const { crewId } = useParams()
  const { getMember, showToast } = useCrew()
  const navigate = useNavigate()
  const member = getMember(crewId)
  // "Whole body" por defecto: el modelo se ve completo, sin zona resaltada ni zoom
  const [zone, setZone] = useState('body')

  // Nivel por sistema del cuerpo; la firma evita recalcular el 3D en cada tick si nada cambió
  const levelSignature = member ? MODULES.map((x) => member.modules[x.key].st).join(',') : ''
  const zoneLevels = useMemo(() => {
    const levels = Object.fromEntries(MODULES.map((x, i) => [x.key, Number(levelSignature.split(',')[i])]))
    const out = {}
    for (const [z, info] of Object.entries(BODY_ZONES)) {
      const ls = info.modules.map((k) => levels[k])
      out[z] = ls.some((l) => l > 0) ? Math.max(...ls) : ls.includes(-1) ? -1 : 0
    }
    return out
  }, [levelSignature])

  if (!member) return <Navigate to="/" replace />

  const st = statusOf(member.level)
  const r = member.readings
  const m = member.modules
  const { charted, others } = splitModules(m)
  const first = member.flagged.slice().sort((a, b) => m[b.key].st - m[a.key].st)[0]
  const protocol = protocolFor(member)
  const zoneMods = BODY_ZONES[zone].modules.map((k) => MODULES.find((x) => x.key === k))
  // Desde la ficha, los módulos se abren solo con los datos de esta persona (sin comparar con otros)
  const openModule = (key) => navigate(`/mod/${key}?crew=${member.id}`)

  return (
    <section className="animate-fade-in space-y-4">
      <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-200">{member.name}</span>
      </nav>

      {/* Cabecera del tripulante: 80 % datos · 20 % botón del test */}
      <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border-[1.5px] bg-panel p-3.5" style={{ borderColor: st.hex }}>
          <img src={member.image} alt="" className="h-14 w-14 rounded-xl border-[1.5px] object-cover" style={{ borderColor: st.hex }} />
          <div>
            <h2 className="text-base font-extrabold uppercase text-white sm:text-lg">{member.name}</h2>
            <p className="flex items-center gap-1 font-mono text-xs text-slate-400">
              {member.role} • <MapPin className="h-3 w-3" aria-hidden />
              {member.location === 'EVA' ? 'Outside (EVA)' : 'Ship'} • {member.crewCode}
            </p>
          </div>
          <span className="ml-2 flex items-center gap-1.5">
            <Heart bpm={m.cardio.st < 0 ? 0 : r.hr} className="h-9 w-9" />
            <span className="font-mono text-2xl font-bold text-white">{m.cardio.st < 0 ? '—' : r.hr}</span>
            <span className="text-xs text-slate-400">bpm</span>
          </span>
          <StatusTag level={member.level} />
        </div>
        <TestButton size="lg" className="h-full min-h-[64px] w-full" onClick={() => navigate(`/mod/fat/test?crew=${member.id}`)}>
          Take fatigue test
        </TestButton>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Columna izquierda: gemelo 3D */}
        <div className="space-y-4">
          <Panel>
            <SectionLabel right={<span className="font-mono text-[10px] text-cyan">3D TWIN</span>}>Tap a body area</SectionLabel>
            <Suspense
              fallback={
                <div className="flex h-[460px] items-center justify-center rounded-lg border border-line/70 bg-void/60 font-mono text-xs text-cyan">
                  Loading 3D model…
                </div>
              }
            >
              <Body3D zoneLevels={zoneLevels} selected={zone} onSelect={setZone} name={member.name.split(' ')[0]} haloHex={st.hex} />
            </Suspense>
            <p className="mt-1.5 text-center text-[11px] text-slate-500">
              Drag to rotate · scroll to zoom · tap a body part or a marker · tap empty space for the whole body
            </p>

            <div className="mt-2 space-y-1.5 rounded-lg border-[1.5px] border-cyan/45 bg-void p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-cyan">{BODY_ZONES[zone].label}</span>
                <StatusTag level={zoneLevels[zone]} short />
              </div>
              <p className="text-[11.5px] text-slate-300">
                <strong className="text-slate-100">Function:</strong> {BODY_ZONES[zone].fn}
              </p>
              {zoneMods.map((x) => {
                const Icon = x.icon
                return (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => openModule(x.key)}
                    className="flex w-full items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5 text-left text-[11.5px] transition hover:border-cyan/60"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden />
                    <span className="font-semibold text-slate-200">{x.name}</span>
                    <span className="truncate text-slate-400">{m[x.key].why}</span>
                    <span className="ml-auto shrink-0 font-mono font-bold" style={{ color: statusOf(m[x.key].st).fg }}>
                      {formatValue(m[x.key].v, x.d)} {x.unit}
                    </span>
                  </button>
                )
              })}
            </div>

          </Panel>

          <Panel>
            <SectionLabel>Today&apos;s goals</SectionLabel>
            <div className="flex flex-wrap justify-around gap-1.5">
              <GoalRing
                pct={r.sleep_hours / 8}
                hex={ringHex(m.fat.st)}
                label="Sleep"
                value={`${formatValue(r.sleep_hours, 1)} of 8 h`}
                icon={BedDouble}
                onClick={() => openModule('fat')}
              />
              <GoalRing
                pct={r.water_l / 3}
                hex={ringHex(r.water_l < 2 ? 1 : 0)}
                label="Water"
                value={`${formatValue(r.water_l, 1)} of 3 L`}
                icon={GlassWater}
                onClick={() => openModule('nut')}
              />
              <GoalRing
                pct={m.nut.v / 100}
                hex={ringHex(m.nut.st)}
                label="Meals"
                value={`${m.nut.v}% of goal`}
                icon={Utensils}
                onClick={() => openModule('nut')}
              />
              <GoalRing
                pct={m.act.v / 120}
                hex={ringHex(m.act.st)}
                label="Exercise"
                value={`${m.act.v} of 120 min`}
                icon={Dumbbell}
                onClick={() => openModule('act')}
              />
            </div>
          </Panel>
        </div>

        {/* Columna derecha: acción, módulos y protocolo */}
        <div className="space-y-4">
          {first && (
            <div
              className="flex items-start gap-2 rounded-xl border-[1.5px] px-3.5 py-2.5 text-sm"
              style={{
                borderColor: statusOf(m[first.key].st).hex,
                background: `linear-gradient(${statusOf(m[first.key].st).hex}14, ${statusOf(m[first.key].st).hex}14), #111726`,
              }}
            >
              <Zap className="mt-0.5 h-4 w-4 shrink-0" style={{ color: statusOf(m[first.key].st).hex }} aria-hidden />
              <span className="text-slate-200">
                <b style={{ color: statusOf(m[first.key].st).fg }}>Act now · {first.name}:</b> {first.todo[0]}
              </span>
            </div>
          )}

          <div>
            <SectionLabel
              right={
                member.flagged.length > 0 && (
                  <span className="text-[11px] text-slate-400">{member.flagged.length} need attention</span>
                )
              }
            >
              Key modules · 7 days
            </SectionLabel>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {charted.map((x, i) => (
                <ModuleCard
                  key={x.key}
                  mod={x}
                  data={m[x.key]}
                  // Cardio a lo ancho; si el resto queda impar, la última tarjeta también
                  wide={x.key === 'cardio' || (i === charted.length - 1 && (charted.length - 1) % 2 === 1)}
                  onClick={() => openModule(x.key)}
                />
              ))}
            </div>

            {others.length > 0 && (
              <div className="mt-2.5 rounded-xl border-[1.5px] border-line bg-panel p-2.5">
                <p className="mb-1.5 px-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Other modules
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {others.map((x) => {
                    const Icon = x.icon
                    return (
                      <button
                        key={x.key}
                        type="button"
                        onClick={() => openModule(x.key)}
                        className="flex items-center gap-2 rounded-lg border border-line bg-void px-2.5 py-2 text-left text-xs transition hover:border-cyan/60"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden />
                        <span className="truncate font-semibold text-slate-200">{x.name}</span>
                        <span
                          className="ml-auto shrink-0 font-mono"
                          style={{ color: m[x.key].st === 0 ? '#CBD5E1' : statusOf(m[x.key].st).fg }}
                        >
                          {formatValue(m[x.key].v, x.d)} <span className="text-slate-500">{x.unit}</span>
                        </span>
                        {m[x.key].st === 0 ? <StatusDot level={0} /> : <StatusTag level={m[x.key].st} short />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <Panel className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">Clinical protocol</span>
              <span
                className="rounded px-2 py-0.5 font-mono text-[9.5px] font-bold"
                style={{ backgroundColor: statusOf(protocol.level).hex, color: protocol.level === 2 ? '#fff' : '#090D16' }}
              >
                {protocol.badge}
              </span>
            </div>
            <div className="space-y-1.5 text-[12px] leading-relaxed">
              <p>
                <strong className="text-cyan">1. Self-assessment:</strong> <span className="text-slate-200">{protocol.measure}</span>
              </p>
              <p>
                <strong className="text-lime">2. Action / management:</strong> <span className="text-slate-200">{protocol.action}</span>
              </p>
              <p>
                <strong className="text-caution">3. Flight surgeon:</strong> <span className="text-slate-200">{protocol.escalate}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => showToast('Biometric package queued for Earth · arrives in ~14 min')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/35 px-3 py-2 text-xs font-bold text-white transition hover:bg-cobalt/55"
              >
                <SatelliteDish className="h-4 w-4" aria-hidden /> Notify Earth
              </button>
              <TestButton size="sm" className="flex-1" onClick={() => navigate(`/mod/fat/test?crew=${member.id}`)}>
                Take fatigue test
              </TestButton>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
