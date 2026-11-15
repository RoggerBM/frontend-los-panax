import EcgStrip from '../EcgStrip'
import { Heart } from '../ui'
import { stableRand } from '../../lib/crewModel'
import { formatValue } from '../../config/modules'
import { AreaChart, DashCard, DashGrid, Digits, HBar, Muted, Pill, Pleth, SemiGauge, VBars } from './primitives'
import { fill, ink } from './colors'

/** Detalle cardiovascular: ECG, VFC, presión arterial (MAP) y SpO₂. */
export default function CardioDetail({ member }) {
  const rr = (n) => stableRand(member.id, n)
  const d = member.modules.cardio
  const r = member.readings
  const bpm = r.hr
  const lost = d.st < 0
  const est = lost ? 'No signal' : bpm > 100 ? 'Moderate tachycardia' : bpm < 50 ? 'Bradycardia' : 'Normal sinus rhythm'
  const hrv = lost ? null : r.hrv
  const hv = Array.from({ length: 12 }, (_, i) => Math.round((hrv || 45) + (rr(i + 3) - 0.5) * 18 - (i > 8 && d.st > 0 ? 8 : 0)))
  const sys = r.bp_sys
  const dia = r.bp_dia
  const map = Math.round((sys + 2 * dia) / 3)
  const bs = sys >= 160 || dia >= 100 ? 2 : sys >= 135 || dia >= 88 ? 1 : 0
  const spo = r.spo2
  const ss = spo < 94 ? 2 : spo < 96 ? 1 : 0

  return (
    <DashGrid>
      <DashCard title="ECG signal · lead II" level={d.st} wide extra={<Pill level={lost ? -1 : bpm > 100 || bpm < 50 ? 2 : 0}>{est}</Pill>}>
        <div className="flex items-center gap-3 overflow-hidden rounded-lg border border-line bg-void">
          <EcgStrip bpm={bpm} color={lost ? '#38FEDC' : fill(d.st > 0 ? d.st : 0)} lost={lost} grid className="h-40 min-w-0 flex-1" />
          <div className="flex w-36 shrink-0 items-center justify-center gap-2 border-l border-line px-3 py-6">
            {lost ? (
              <p className="text-right text-sm font-bold text-white">
                Signal lost
                <br />
                <span className="text-[11px] font-normal text-slate-400">Check the electrode · not a clinical alert</span>
              </p>
            ) : (
              <>
                <Heart bpm={bpm} className="h-10 w-10" />
                <div>
                  <b className="block font-mono text-4xl leading-none text-white">{bpm}</b>
                  <span className="text-xs text-slate-400">bpm</span>
                </div>
              </>
            )}
          </div>
        </div>
        <Muted className="mt-1.5">ECG · real time (simulated)</Muted>
      </DashCard>

      <DashCard title="Heart rate variability (HRV)" level={d.st > 0 ? d.st : 0}>
        <div className="flex items-end gap-3">
          <VBars scale={1.3} items={hv.map((v, i) => ({ v, level: v < 32 ? 2 : v < 42 ? 1 : 0, tip: `${11 - i} h ago: ${v} ms` }))} />
          <div>
            <Digits value={hrv ?? '—'} unit="ms" size="text-4xl" />
            <Muted>
              Risk:{' '}
              <b style={{ color: ink(d.st) }}>{d.st === 2 ? 'high · autonomic stress' : d.st === 1 ? 'moderate' : 'low'}</b>
            </Muted>
          </div>
        </div>
      </DashCard>

      <DashCard title="Blood pressure (MAP)" level={bs}>
        <div className="flex items-center gap-2.5">
          <SemiGauge value={sys} max={200} zones={[135, 160]} text={`${sys}/${dia}`} label="Systolic pressure" />
          <div className="min-w-0 flex-1">
            <AreaChart values={Array.from({ length: 14 }, (_, i) => map - 6 + rr(i + 20) * 8 + (i > 9 && bs ? bs * 4 : 0))} level={bs} />
            <Muted>
              MAP: <b className="text-slate-100">{map} mmHg</b> · last reading
            </Muted>
          </div>
        </div>
      </DashCard>

      <DashCard title="Oxygen saturation (SpO₂)" level={ss} wide>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Pleth level={ss} bpm={bpm} />
          </div>
          <div className="text-right">
            <Digits value={`${spo}%`} level={ss} />
            <Muted>SpO₂ · PI {formatValue(3.5 + rr(7) * 2, 1)}%</Muted>
          </div>
        </div>
        <HBar pct={spo / 100} level={ss} label="Goal ≥ 95%" value={`${spo}%`} />
      </DashCard>
    </DashGrid>
  )
}
