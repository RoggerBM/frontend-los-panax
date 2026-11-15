import { LEVEL_HEX } from '../lib/nutritionModel'

const MUTED = '#94A3B8'
const MASS = '#7DD3FC'
const NOW = '#38FEDC'

const dayLabel = (i) => (i === 29 ? 'today' : `D${i - 29}`)

/** Energía de cada día (30 días) con meta, promedio ISS y tendencia de 14 días. */
export function EnergyChart({ R }) {
  const D = R.D
  const w = 1000
  const h = 230
  const px = (i) => 50 + (i * (w - 80)) / 29
  const py = (v) => h - 30 - ((v - 0.3) / (1.15 - 0.3)) * (h - 50)
  const f = R.fe
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="30-day energy intake">
      {[
        [1, 'goal 100%', LEVEL_HEX[0]],
        [0.8, 'ISS average ~80%', LEVEL_HEX[1]],
      ].map(([v, t, c]) => (
        <g key={t}>
          <line x1="50" x2={w - 30} y1={py(v)} y2={py(v)} stroke={c} strokeDasharray="5 5" strokeOpacity="0.7" />
          <text x={w - 32} y={py(v) - 5} textAnchor="end" fontSize="12" fill={c}>
            {t}
          </text>
        </g>
      ))}
      {D.map((d, i) => {
        const c = d.e < 0.7 ? '#C51111' : d.e < 0.85 ? LEVEL_HEX[1] : LEVEL_HEX[0]
        return (
          <g key={i}>
            <rect x={px(i) - 11} y={py(d.e)} width="22" height={h - 30 - py(d.e)} rx="4" fill={c} fillOpacity="0.75">
              <title>{`${dayLabel(i)}: ${Math.round(d.e * 100)}% energy · ${d.w} mL water${d.sk ? ' · skipped a meal' : ''}`}</title>
            </rect>
            {i % 5 === 4 && (
              <text x={px(i)} y={h - 10} textAnchor="middle" fontSize="12" fill={MUTED}>
                {dayLabel(i)}
              </text>
            )}
          </g>
        )
      })}
      <line x1={px(16)} y1={py(f.a)} x2={px(29)} y2={py(f.a + f.b * 13)} stroke="#F1F5F9" strokeWidth="2.5" />
      <text x={px(16)} y={py(f.a) - 8} fontSize="12" fill="#F1F5F9">
        14-day trend
      </text>
    </svg>
  )
}

/** Masa corporal de 30 días y proyección de la IA a 30 días más. */
export function MassChart({ R }) {
  const D = R.D
  const a = R.a
  const w = 1000
  const h = 170
  const n = 60
  const ms = D.map((x) => x.m)
  const fut = Array.from({ length: 30 }, (_, k) => R.fm.a + R.fm.b * (13 + k + 1))
  const all = [...ms, ...fut, a.kg]
  const mn = Math.min(...all) - 0.6
  const mx = Math.max(...all) + 0.6
  const px = (i) => 50 + (i * (w - 80)) / (n - 1)
  const py = (v) => h - 28 - ((v - mn) / (mx - mn)) * (h - 44)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Body mass and projection">
      <line x1="50" x2={w - 30} y1={py(a.kg)} y2={py(a.kg)} stroke={MUTED} strokeDasharray="4 4" />
      <text x="54" y={py(a.kg) - 5} fontSize="12" fill={MUTED}>
        pre-flight {a.kg} kg
      </text>
      <polyline points={ms.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={MASS} strokeWidth="2.5" />
      <polyline
        points={[ms[29], ...fut].map((v, i) => `${px(29 + i)},${py(v)}`).join(' ')}
        fill="none"
        stroke={MASS}
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <line x1={px(29)} x2={px(29)} y1="8" y2={h - 28} stroke={NOW} strokeDasharray="3 4" />
      <text x={px(29) + 6} y="18" fontSize="12" fill={NOW}>
        today · AI projection →
      </text>
      {ms.map((v, i) =>
        i % 3 === 2 ? (
          <circle key={i} cx={px(i)} cy={py(v)} r="7" fill="transparent">
            <title>{`${dayLabel(i)}: ${v.toFixed(1)} kg`}</title>
          </circle>
        ) : null,
      )}
      <circle cx={px(59)} cy={py(fut[29])} r="5" fill={MASS} />
      <text x={px(59) - 6} y={py(fut[29]) + (R.fm.b < 0 ? 18 : -8)} textAnchor="end" fontSize="12" fill={MASS}>
        {fut[29].toFixed(1)} kg in 30 days
      </text>
    </svg>
  )
}

/** Anillo de riesgo nutricional (0–100). */
export function RiskGauge({ R }) {
  const c = LEVEL_HEX[R.st]
  const r = 42
  const L = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 100" width="104" height="104" className="shrink-0" aria-label={`Nutrition risk ${R.risk} of 100`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#24304A" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={c}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(L * R.risk) / 100} ${L}`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray .5s' }}
      />
      <text x="50" y="50" textAnchor="middle" fontSize="24" fontWeight="700" fill={c}>
        {R.risk}
      </text>
      <text x="50" y="66" textAnchor="middle" fontSize="10" fill={MUTED}>
        of 100
      </text>
    </svg>
  )
}
