import clsx from 'clsx'
import { Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNow } from '@/shared/hooks/useNow'
import { formatValue } from '../../config/modules'
import { stableRand } from '../../lib/crewModel'
import { Arc270, DashCard, DashGrid, Digits, Muted, Pill, VBars } from './primitives'
import { fill, ink } from './colors'

/** Mini test de reacción (5 intentos) del ejemplo: tocar cuando el recuadro se pone verde. */
function MiniPvt({ onDone }) {
  const [phase, setPhase] = useState('idle') // idle | wait | go | early | done
  const [times, setTimes] = useState([])
  const t0 = useRef(0)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const tap = () => {
    if (phase === 'done') {
      setTimes([])
      setPhase('idle')
      return
    }
    if (phase === 'idle' || phase === 'early') {
      setPhase('wait')
      timer.current = setTimeout(() => {
        t0.current = performance.now()
        setPhase('go')
      }, 900 + Math.random() * 1800)
      return
    }
    if (phase === 'wait') {
      clearTimeout(timer.current)
      setPhase('early')
      return
    }
    const ms = Math.round(performance.now() - t0.current)
    const next = [...times, ms]
    setTimes(next)
    if (next.length >= 5) {
      setPhase('done')
      onDone(Math.round(next.reduce((a, b) => a + b, 0) / next.length))
    } else setPhase('idle')
  }

  const label = {
    idle: times.length ? `${times[times.length - 1]} ms · ${times.length}/5 · tap to continue` : null,
    wait: 'Wait for green…',
    go: 'Tap!',
    early: 'Too early · try again',
    done: 'Done · tap to repeat',
  }[phase]

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        tap()
      }}
      className={clsx(
        'flex h-[90px] w-full touch-manipulation select-none items-center justify-center gap-2 rounded-xl border-2 px-2.5 text-center text-base font-bold transition-colors',
        phase === 'wait' && 'border-critical bg-critical/20 text-white',
        phase === 'go' && 'border-lime bg-lime text-void',
        phase === 'early' && 'border-caution text-caution',
        phase === 'done' && 'border-lime text-lime',
        (phase === 'idle' || !phase) && 'border-dashed border-line bg-panel text-slate-200',
      )}
    >
      {label ?? (
        <>
          <Play className="h-4 w-4" aria-hidden /> Tap to take the test (5 tries)
        </>
      )}
    </button>
  )
}

/** Detalle de fatiga: sueño, nivel de fatiga, test PVT y ciclo circadiano. */
export default function FatigueDetail({ member }) {
  const rr = (n) => stableRand(member.id, n)
  const now = useNow(60000)
  const [miniPvt, setMiniPvt] = useState(null)

  const d = member.modules.fat
  const sl = d.v
  const nights = Array.from({ length: 7 }, (_, i) => (i === 6 ? sl : +(6.4 + rr(i + 50) * 1.6 - (d.st > 0 && i > 3 ? 1.2 : 0)).toFixed(1)))
  const pv = miniPvt ?? Math.round(member.lastTest?.times?.reaction ?? member.readings.pvt_ms)
  const ps = pv > 500 ? 2 : pv > 350 ? 1 : 0
  const fl = Math.max(0, Math.round(Math.min(100, (1 - Math.min(1, sl / 8)) * 110 + (pv - 250) / 5)))
  const fs = fl > 65 ? 2 : fl > 40 ? 1 : 0
  const stages = Array.from({ length: 32 }, (_, i) => Math.round(1 + Math.abs(Math.sin(i / 5 + rr(i))) * 2 + (i % 9 === 0 ? 1 : 0)))
  const hr = now.getHours() + now.getMinutes() / 60
  const cx = (hr / 24) * 300
  const shifted = d.st !== 0
  const night = hr >= 19 || hr < 6

  return (
    <DashGrid>
      <DashCard title="Sleep hours and quality" level={d.st}>
        <div className="flex items-end gap-3.5">
          <VBars
            scale={11}
            items={nights.map((v, i) => ({
              v,
              level: v < 5 ? 2 : v < 6 ? 1 : 0,
              tip: `${i === 6 ? 'Last night' : `${6 - i} nights ago`}: ${formatValue(v, 1)} h`,
            }))}
          />
          <div>
            <Digits value={formatValue(sl, 1)} unit="h" level={d.st} />
            <Pill level={d.st}>{sl < 6 ? 'Sleep deficit' : 'Enough sleep'}</Pill>
          </div>
        </div>
        <svg viewBox="0 0 320 54" width="100%" height="54" className="mt-2" aria-label="Sleep stages">
          {['Awake', 'Light', 'Deep'].map((t, j) => (
            <text key={t} x="0" y={12 + j * 16} fontSize="9" fill="#94A3B8">
              {t}
            </text>
          ))}
          {stages.map((s, i) => (
            <rect key={i} x={52 + i * 8.4} y={4 + (Math.min(3, s) - 1) * 16} width="7.4" height="12" rx="2" fill="#38FEDC" fillOpacity={0.35 + 0.2 * s} />
          ))}
        </svg>
      </DashCard>

      <DashCard title="Fatigue and alertness level" level={fs}>
        <div className="flex items-center gap-3.5">
          <Arc270 pct={fl / 100} level={fs}>
            <text x="65" y="70" textAnchor="middle" fontSize="28" fontWeight="800" fill="#F1F5F9">
              {fl}%
            </text>
            <text x="65" y="88" textAnchor="middle" fontSize="10" fill="#94A3B8">
              fatigue
            </text>
          </Arc270>
          <div>
            <div className="text-xl font-bold" style={{ color: ink(fs) }}>
              Level {fs === 2 ? 'high' : fs ? 'moderate' : 'low'}
            </div>
            <Muted>{fs === 2 ? 'No EVA or equipment operation' : fs ? 'Postpone critical tasks' : 'Fit for critical tasks'}</Muted>
          </div>
        </div>
      </DashCard>

      <DashCard title="Reaction test (PVT)" level={ps}>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Digits value={pv} unit="ms" level={ps} />
          <Pill level={ps}>{ps === 2 ? 'Slow · alertness deficit' : ps ? 'Somewhat slow' : 'Normal'}</Pill>
          <Muted className="ml-auto">Personal baseline ~250 ms</Muted>
        </div>
        <MiniPvt onDone={setMiniPvt} />
      </DashCard>

      <DashCard title="Circadian cycle and recommended light" level={shifted ? 1 : 0}>
        <svg viewBox="0 0 300 90" width="100%" height="90" preserveAspectRatio="none" aria-label="Circadian cycle">
          <path
            d={Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${i * 5} ${45 - Math.sin((i / 60) * Math.PI * 2 - Math.PI / 2 + (shifted ? 0.6 : 0)) * 32}`).join(' ')}
            fill="none"
            stroke={fill(1)}
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
          <line x1={cx} y1="0" x2={cx} y2="90" stroke="#38FEDC" strokeDasharray="3 3" />
          <text x={Math.min(cx + 4, 250)} y="12" fontSize="10" fill="#38FEDC">
            now
          </text>
        </svg>
        <div className="flex flex-wrap justify-between gap-1.5 text-xs text-slate-300">
          <span>
            Phase shift: <b style={{ color: ink(shifted ? 1 : 0) }}>{shifted ? 'slight' : 'none'}</b>
          </span>
          <span>
            Cabin light: <b style={{ color: ink(1) }}>{night ? 'warm, low' : 'bright white'}</b>
          </span>
          <span>{shifted ? 'Rest suggested' : 'Keep schedule'}</span>
        </div>
      </DashCard>
    </DashGrid>
  )
}
