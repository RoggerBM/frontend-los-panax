import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { CAREER_LIMIT_MSV, missionDay } from '../../config/mission'
import { formatValue } from '../../config/modules'
import { DashCard, DashGrid, Digits, HBar, Muted, SegBar } from './primitives'
import { fill, ink } from './colors'

/** Detalle de radiación: dosis acumulada, alerta de tormenta solar, tasa actual y zonas de blindaje. */
export default function RadiationDetail({ member }) {
  const d = member.modules.rad
  const dose = d.v
  // Tormenta: dosis diaria en nivel de alerta (≥ 1,5 mSv/d)
  const storm = d.st === 2
  const acc = Math.round(missionDay() * 0.5 + (storm ? dose * 1.5 : 0))
  const pct = acc / CAREER_LIMIT_MSV
  const ush = Math.round((dose * 1000) / 24)
  const first = member.name.split(' ')[0]
  const eva = member.location === 'EVA'
  // s: 0 normal · 1 precaución · 2 alerta · 3 refugio activo · 4 tripulante en EVA
  const zones = [
    ['Laboratory', 8, 0],
    ['Habitat', 70, storm ? 1 : 0],
    ['Shelter', 132, storm ? 3 : 0],
    ['Node', 194, 0],
    ['EVA airlock', 256, storm ? 2 : eva ? 4 : 0],
  ]
  const zoneFill = (s) => (s === 3 ? fill(0) : s === 2 ? fill(2) : s === 1 ? fill(1) : s === 4 ? '#38FEDC' : '#111726')

  return (
    <DashGrid>
      <DashCard title="Personal accumulated dose" level={0}>
        <Digits value={formatValue(acc, 1)} unit="mSv" size="text-5xl" />
        <HBar
          pct={pct}
          level={pct > 0.8 ? 2 : pct > 0.5 ? 1 : 0}
          label={`NASA career limit: ${CAREER_LIMIT_MSV} mSv`}
          value={`${Math.round(pct * 100)}%`}
        />
        <Muted>Estimated with ~0.5 mSv/day in orbit (demo)</Muted>
      </DashCard>

      <DashCard title="Solar storm alert" level={storm ? 2 : 0}>
        {storm ? (
          <>
            <div className="flex items-center gap-2 text-2xl font-extrabold" style={{ color: ink(2) }}>
              <AlertTriangle className="h-6 w-6" aria-hidden /> Active radiation storm
            </div>
            <div className="my-2 text-lg" style={{ color: ink(1) }}>
              Shelter activated
            </div>
            <Muted className="flex justify-between">
              <span>Real particle event · May 10, 2024 (NASA DONKI)</span>
              <span>00:27 h</span>
            </Muted>
            <Muted className="mt-1.5">Suspend EVA · go to the most shielded modules</Muted>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: ink(0) }}>
              <CheckCircle2 className="h-6 w-6" aria-hidden /> Quiet space weather
            </div>
            <Muted className="mt-2">No solar particle events in DONKI · NOAA scale S0</Muted>
          </>
        )}
      </DashCard>

      <DashCard title="Current dose rate" level={d.st}>
        <Digits value={ush} unit="µSv/h" level={d.st} size="text-5xl" />
        <SegBar pct={Math.min(1, dose / 4)} labels={['Normal', 'Elevated', 'High', 'Very high']} />
      </DashCard>

      <DashCard title="Shielding and ship zones" level={storm ? 1 : 0}>
        <svg viewBox="0 0 320 110" width="100%" height="110" aria-label="Ship layout">
          <g stroke="#24304A" strokeWidth="2">
            {zones.map(([n, x, s]) => (
              <g key={n}>
                <rect
                  x={x}
                  y="30"
                  width="56"
                  height="50"
                  rx="10"
                  fill={zoneFill(s)}
                  fillOpacity={s ? 0.4 : 1}
                  className={s === 3 || s === 4 ? 'animate-critical' : undefined}
                />
                <text x={x + 28} y="98" textAnchor="middle" fontSize="10" fill="#94A3B8" stroke="none">
                  {n}
                </text>
              </g>
            ))}
          </g>
          <text x="10" y="18" fontSize="11" fill="#F1F5F9">
            {storm ? `${first}: ${eva ? 'on EVA · return' : 'in shelter'}` : `${first}: ${eva ? 'EVA · outside the ship' : 'inside the ship'}`}
          </text>
        </svg>
        <Muted>
          Status:{' '}
          {storm ? <b style={{ color: ink(2) }}>crew to shelter</b> : <b style={{ color: ink(0) }}>shielding nominal</b>}
        </Muted>
      </DashCard>
    </DashGrid>
  )
}
