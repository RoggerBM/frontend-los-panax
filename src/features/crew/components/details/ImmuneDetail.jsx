import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { formatValue } from '../../config/modules'
import { stableRand } from '../../lib/crewModel'
import { Arc270, AreaChart, DashCard, DashGrid, Digits, HBar, Muted, Pill, SegBar } from './primitives'
import { fill, ink } from './colors'

const SYMPTOMS = ['Nasal congestion', 'Sore throat', 'Eye irritation', 'General fatigue', 'Mild malaise']

/** Detalle inmunológico: temperatura central, índice de recuperación, cortisol y chequeo de síntomas. */
export default function ImmuneDetail({ member }) {
  const rr = (n) => stableRand(member.id, n)
  const [source, setSource] = useState('saliva')
  const [symptoms, setSymptoms] = useState(() => new Set())

  const d = member.modules.inm
  const t = d.v
  const ts = d.st
  const fat = member.modules.fat
  const con = member.modules.con
  const cort = +(0.32 + (con.st > 0 ? 0.25 : 0) + (fat.st > 0 ? 0.12 : 0) + rr(8) * 0.1).toFixed(2)
  const cs = cort > 0.65 ? 2 : cort > 0.5 ? 1 : 0
  const pS = Math.min(1, fat.v / 8)
  const pT = Math.max(0, 1 - Math.abs(t - 36.7) / 1.2)
  const pE = 1 - Math.min(1, cort / 0.9)
  const idx = Math.round((pS * 0.4 + pT * 0.35 + pE * 0.25) * 100)
  const is = idx < 60 ? 2 : idx < 75 ? 1 : 0
  const ssy = symptoms.size >= 3 ? 2 : symptoms.size ? 1 : 0
  const tv = Array.from(
    { length: 30 },
    (_, i) => 36.6 + Math.sin((i / 30) * Math.PI * 2 - 1.4) * 0.25 + (rr(i + 40) - 0.5) * 0.08 + (ts > 0 && i > 22 ? (i - 22) * 0.12 : 0),
  )
  const tempPill = ts === 2 ? 'Fever' : ts === 1 ? 'Low-grade fever' : ts < 0 ? 'Check sensor' : 'Normal · no fever'

  const toggle = (i) =>
    setSymptoms((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <DashGrid>
      <DashCard title="Core body temperature" level={ts}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <AreaChart values={tv} level={ts} lo={36.1} hi={37.2} />
            <Muted className="flex justify-between">
              <span>−30 h</span>
              <span>now</span>
            </Muted>
          </div>
          <div className="text-right">
            <Digits value={`${formatValue(t, 1)}°C`} level={ts} />
            <Pill level={ts}>{tempPill}</Pill>
          </div>
        </div>
      </DashCard>

      <DashCard title="Defensive recovery index" level={is}>
        <div className="flex items-center gap-3.5">
          <Arc270 pct={idx / 100} level={is}>
            <text x="65" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fill="#F1F5F9">
              {idx}%
            </text>
          </Arc270>
          <div className="min-w-0 flex-1">
            <HBar pct={pS} level={fat.st < 0 ? 0 : fat.st} label="Sleep" value={`${formatValue(fat.v, 1)} h`} />
            <HBar pct={pT} level={ts} label="Temperature" value={`${formatValue(t, 1)} °C`} />
            <HBar pct={pE} level={cs} label="Stress (cortisol)" value={cs ? 'elevated' : 'normal'} />
          </div>
        </div>
        <Muted>
          Combines sleep, temperature and stress · {is === 0 ? 'optimal' : is === 1 ? 'watch' : 'low: rest and report if it gets worse'}
        </Muted>
      </DashCard>

      <DashCard title="Cortisol" level={cs}>
        <div className="mb-2.5 inline-flex overflow-hidden rounded-lg border border-line">
          {[
            ['saliva', 'Saliva'],
            ['sweat', 'Sweat (skin sensor)'],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSource(k)}
              className={clsx('px-3 py-1.5 text-xs transition', source === k ? 'bg-cyan font-bold text-void' : 'bg-panel text-slate-400 hover:text-slate-200')}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-baseline gap-2">
          <Digits value={formatValue(source === 'sweat' ? cort * 1.4 : cort, 2)} level={cs} />
          <span className="text-sm text-slate-400">µg/dL</span>
          <span className="ml-auto">
            <Pill level={cs}>{cs === 2 ? 'High' : cs ? 'Moderate · mild stress' : 'Normal'}</Pill>
          </span>
        </div>
        <SegBar pct={cort / 0.9} />
        <Muted className="mt-1">{source === 'saliva' ? 'Saliva sample on waking' : 'Sweat sensor on the patch'} · demo values</Muted>
      </DashCard>

      <DashCard title="Quick symptom check" level={ssy}>
        <Muted className="mb-2">Mark any mild discomfort you have today</Muted>
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOMS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={symptoms.has(i)}
              className={clsx(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition',
                symptoms.has(i) ? 'border-cyan bg-cyan font-semibold text-void' : 'border-line bg-panel text-slate-300 hover:border-cyan',
              )}
            >
              {symptoms.has(i) && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
              {s}
            </button>
          ))}
        </div>
        <div
          className="mt-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: fill(ssy), color: ink(ssy), backgroundColor: `${fill(ssy)}14` }}
        >
          {symptoms.size
            ? `${symptoms.size} mild symptom${symptoms.size > 1 ? 's' : ''}: repeat the temperature in 30 min. If it persists for more than 24 h, notify Earth.`
            : 'No symptoms logged today'}
        </div>
      </DashCard>
    </DashGrid>
  )
}
