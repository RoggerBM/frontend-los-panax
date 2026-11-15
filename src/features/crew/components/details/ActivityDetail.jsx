import { stableRand } from '../../lib/crewModel'
import { Arc270, DashCard, DashGrid, Digits, HBar, Muted, Pill } from './primitives'
import { fill } from './colors'

/** Detalle de actividad física: tiempo de entrenamiento, sesiones, carga muscular y preservación ósea. */
export default function ActivityDetail({ member }) {
  const rr = (n) => stableRand(member.id, n)
  const d = member.modules.act
  const min = d.v
  const as = d.st
  const mus = Math.round(70 + rr(13) * 20)
  const bone = Math.round(85 + rr(14) * 12)
  const bs = bone < 85 ? 1 : 0
  const part = Math.round(min * 0.4)
  const sessions = [
    ['T2 · treadmill (impact)', part],
    ['ARED · resistance', part],
    ['CEVIS · cycle', min - part * 2],
  ]
  const ok = fill(0)

  return (
    <DashGrid>
      <DashCard title="Daily training time" level={as}>
        <div className="flex items-center gap-3.5">
          <Arc270 pct={min / 120} level={as === 0 && min < 120 ? 1 : as}>
            <text x="65" y="74" textAnchor="middle" fontSize="30" fontWeight="800" fill="#F1F5F9">
              {min}
            </text>
          </Arc270>
          <div>
            <Digits value={min} unit="/ 120 min" />
            <div className="mt-1.5">
              <Pill level={min >= 120 ? 0 : 1}>{min >= 120 ? 'Goal met' : 'In progress'}</Pill>
            </div>
          </div>
        </div>
      </DashCard>

      <DashCard title="Today's sessions" level={0}>
        {sessions.map(([n, v]) => (
          <HBar key={n} pct={v / 48} level={v >= 40 ? 0 : 1} label={n} value={`${v} min`} />
        ))}
        <Muted>ISS exercise equipment: T2, ARED and CEVIS</Muted>
      </DashCard>

      <DashCard title="Muscle strength and load estimate" level={0}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 80 150" width="80" height="150" aria-label="Muscle groups">
            <circle cx="40" cy="14" r="10" fill="#111726" stroke="#24304A" />
            <rect x="26" y="27" width="28" height="44" rx="9" fill="#111726" stroke="#24304A" />
            <rect x="12" y="29" width="10" height="44" rx="5" fill={ok} fillOpacity="0.45" />
            <rect x="58" y="29" width="10" height="44" rx="5" fill={ok} fillOpacity="0.45" />
            <rect x="27" y="74" width="12" height="70" rx="6" className="animate-critical" fill={ok} fillOpacity="0.6" />
            <rect x="41" y="74" width="12" height="70" rx="6" className="animate-critical" fill={ok} fillOpacity="0.6" />
          </svg>
          <div>
            <Digits value={`${mus}%`} level={0} />
            <Pill level={0}>Optimal</Pill>
            <Muted className="mt-1.5">Legs and back: the groups that lose the most in microgravity</Muted>
          </div>
        </div>
      </DashCard>

      <DashCard title="Bone preservation · impact force" level={bs}>
        <div className="flex items-center gap-3.5">
          <div className="min-w-0 flex-1">
            <HBar pct={0.78 + rr(15) * 0.15} level={0} label="Treadmill impact (T2)" value="correct" />
            <HBar pct={0.8 + rr(16) * 0.15} level={0} label="ARED resistance" value="optimal" />
          </div>
          <div className="text-right">
            <Digits value={`${bone}%`} level={bs} />
            <Pill level={bs}>Stable</Pill>
          </div>
        </div>
        <Muted>Estimated from exercise load · does not measure bone density</Muted>
      </DashCard>
    </DashGrid>
  )
}
