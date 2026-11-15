import { THRESHOLDS as T } from '../config/validation'

const RANK = { ok: 0, caution: 1, fail: 2 }

export const VERDICTS = {
  ok: { label: 'Fit', description: 'Alertness within the expected range.' },
  caution: { label: 'Fit with caution', description: 'Mild signs of fatigue. Consider taking breaks.' },
  fail: { label: 'Not fit', description: 'Clear signs of fatigue. Rest is recommended.' },
}

function gradeHigherIsWorse(value, { caution, fail }) {
  if (value == null) return 'caution'
  if (value >= fail) return 'fail'
  if (value >= caution) return 'caution'
  return 'ok'
}

function gradeLowerIsWorse(value, { caution, fail }) {
  if (value == null) return 'caution'
  if (value < fail) return 'fail'
  if (value < caution) return 'caution'
  return 'ok'
}

const ms = (v) => (v == null ? '—' : `${Math.round(v)} ms`)

/**
 * Combina los resultados de los tres bloques en un veredicto.
 * results: { pvt, gonogo, stroop } (resúmenes de cada prueba)
 * baseline: primera validación del usuario (o null)
 */
export function evaluateValidation({ pvt, gonogo, stroop }, baseline) {
  const checks = [
    {
      label: 'Reaction time',
      value: ms(pvt.medianRt),
      level: gradeHigherIsWorse(pvt.medianRt, T.pvtMedianRt),
    },
    {
      label: 'Attention lapses',
      value: String(pvt.lapses),
      level: gradeHigherIsWorse(pvt.lapses, T.pvtLapses),
    },
    {
      label: 'Impulse control',
      value: `${gonogo.commissions} error(s)`,
      level: gradeHigherIsWorse(gonogo.commissions, T.gonogoCommissions),
    },
    {
      label: 'Accuracy under conflict',
      value: stroop.accuracy == null ? '—' : `${Math.round(stroop.accuracy)} %`,
      level: gradeLowerIsWorse(stroop.accuracy, T.stroopAccuracy),
    },
  ]

  const baseRt = baseline?.pvt?.medianRt
  if (baseRt && pvt.medianRt) {
    const ratio = pvt.medianRt / baseRt
    const pct = Math.round((ratio - 1) * 100)
    checks.push({
      label: 'Versus your baseline',
      value: `${pct > 0 ? '+' : ''}${pct} %`,
      level: ratio >= T.baselineSlowdown ? 'caution' : 'ok',
    })
  }

  const verdict = checks.reduce((worst, c) => (RANK[c.level] > RANK[worst] ? c.level : worst), 'ok')

  return {
    verdict,
    checks,
    times: {
      reaction: pvt.medianRt, // reacción simple
      decision: gonogo.meanRt, // reaccionar eligiendo (verde/rojo)
      control: stroop.meanIncongruent, // reaccionar con conflicto
    },
  }
}
