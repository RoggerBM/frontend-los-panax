import { hashString } from '@/shared/utils/math'
import { MODULES, MODULE_BY_KEY, formatValue } from '../config/modules'
import { BASE_READINGS } from '../config/scenarios'
import { worstLevel } from '../config/status'

/** Generador pseudoaleatorio determinista (mulberry32). */
export function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SUIT_STRIPES = ['#F5F557', '#38FEDC', '#50EF39', '#EF7D0D', '#132ED1']
const MOODS = ['Low', 'Tense', 'Neutral', 'Focused', 'Optimal']

/** Lecturas de respaldo (sin backend): base del escenario + variación personal fija. */
export function fallbackReadings(crewId, scenario) {
  const rnd = seededRandom(hashString(`${crewId}:offline`))
  const r = { ...BASE_READINGS[scenario] }
  r.hr = Math.round(r.hr + (rnd() - 0.5) * 8)
  r.hrv = Math.round(r.hrv + (rnd() - 0.5) * 8)
  r.bp_sys = Math.round(r.bp_sys + (rnd() - 0.5) * 8)
  r.pvt_ms = Math.round(r.pvt_ms + (rnd() - 0.5) * 30)
  r.glucose = Math.round(r.glucose + (rnd() - 0.5) * 8)
  return r
}

const pctOver = (v, base) => Math.round(((v - base) / base) * 100)

/** Reglas de estado por módulo a partir de las lecturas de sensores. */
function evaluateModules(r, exerciseMin) {
  const out = {}

  // Cardiovascular
  {
    let st = 0
    const why = []
    if (r.hr > 110 || r.hr < 45 || r.spo2 < 92) st = 2
    else if (r.hr > 95 || r.hr < 50 || r.bp_sys >= 135 || r.bp_sys < 108 || r.hrv < 35) st = 1
    if (r.hr > 95) why.push(`Resting heart rate ${pctOver(r.hr, 68)}% above their normal`)
    if (r.hr < 50) why.push(`Low heart rate (${r.hr} bpm)`)
    if (r.bp_sys >= 135) why.push(`Blood pressure ${r.bp_sys}/${r.bp_dia} mmHg`)
    if (r.bp_sys < 108) why.push(`Low blood pressure ${r.bp_sys}/${r.bp_dia} mmHg (orthostatic)`)
    if (r.hrv < 35) why.push(`Low HRV (${r.hrv} ms)`)
    if (r.spo2 < 92) why.push(`SpO₂ ${r.spo2}%`)
    out.cardio = { v: r.hr, st, why: why.join(' · ') || 'Within their normal range' }
  }

  // Radiación
  {
    const v = r.dose_msv_day
    const st = v >= 1.5 ? 2 : v >= 0.8 ? 1 : 0
    const why =
      st === 2
        ? `Dose ×${(v / 0.5).toFixed(0)} above normal: shelter and no EVA`
        : st === 1
          ? 'Elevated dose: limit EVA and stay in shielded modules'
          : 'Within ALARA limits'
    out.rad = { v, st, why }
  }

  // Inmunológico (temperatura con sensor redundante T1/T2)
  {
    const delta = Math.abs(r.t_core - r.t_skin)
    if (delta > 1) {
      out.inm = {
        v: r.t_core,
        st: -1,
        why: `T2 thermistor drifts Δ ${delta.toFixed(1)} °C. The reading is discarded and does not trigger a clinical alert`,
      }
    } else {
      const st = r.t_core >= 38 ? 2 : r.t_core >= 37.4 ? 1 : 0
      out.inm = {
        v: r.t_core,
        st,
        why: st === 2 ? `Fever ${r.t_core.toFixed(1)} °C` : st === 1 ? 'Temperature above their normal' : 'Within their normal range',
      }
    }
  }

  // Fatiga
  {
    let st = r.sleep_hours < 5 ? 2 : r.sleep_hours < 6 ? 1 : 0
    const why = []
    if (r.sleep_hours < 6) why.push(`${formatValue(r.sleep_hours, 1)} h of sleep`)
    if (r.pvt_ms > 500) st = 2
    else if (r.pvt_ms > 350) st = Math.max(st, 1)
    if (r.pvt_ms > 350) why.push(`slow PVT reaction (${r.pvt_ms} ms)`)
    out.fat = { v: r.sleep_hours, st, why: why.join(' and ') || 'Enough sleep and normal reaction' }
  }

  // Conductual
  {
    const st = r.mood <= 2 || r.kss >= 7 ? 1 : 0
    out.con = {
      v: r.mood,
      st,
      why: st ? `Mood ${r.mood}/5 and KSS sleepiness ${r.kss}/9` : 'Stable mood',
    }
  }

  // Actividad física (no viene de los sensores del backend: registro de la rutina)
  {
    const st = exerciseMin < 75 ? 2 : exerciseMin < 95 ? 1 : 0
    out.act = { v: exerciseMin, st, why: st ? `Only ${exerciseMin} of 120 min of exercise` : 'Exercise routine on target' }
  }

  // Nutrición
  {
    let st = 0
    const why = []
    if (r.glucose > 140 || r.glucose < 70 || r.caloric_pct < 70) st = 2
    else if (r.glucose > 110 || r.caloric_pct < 85 || r.water_l < 2) st = 1
    if (r.glucose > 110 || r.glucose < 70) why.push(`Glucose ${r.glucose} mg/dL`)
    if (r.caloric_pct < 85) why.push(`${r.caloric_pct}% of the calorie goal`)
    if (r.water_l < 2) why.push(`only ${formatValue(r.water_l, 1)} L of water`)
    out.nut = { v: r.caloric_pct, st, why: why.join(' · ') || 'Intake and glucose as expected' }
  }

  return out
}

/** Aleatorio estable en [0,1) por tripulante y canal (equivale a rr(id, n) del HTML de referencia). */
export function stableRand(id, n) {
  const x = Math.sin(hashString(id) * 12.9898 + n * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** 23 días previos a la semana (paseo que vuelve a la media), para la tendencia de 30 días. */
function monthHistory(mod, rnd) {
  const l = []
  let x = mod.b
  for (let i = 0; i < 23; i += 1) {
    x = mod.b + (x - mod.b) * 0.6 + (rnd() - 0.5) * mod.sd * 1.4
    l.push(x)
  }
  return l
}

/** Serie de 7 días que termina en el valor actual; si hay alerta, deriva hacia él. */
function weekSeries(mod, v, st, rnd) {
  const s = Array.from({ length: 7 }, () => mod.b + (rnd() - 0.5) * mod.sd * 1.6)
  if (v == null) return s
  if (st > 0) {
    const from = s[3]
    for (let i = 4; i < 7; i += 1) s[i] = from + ((v - from) * (i - 3)) / 3
  }
  s[6] = v
  return s
}

/**
 * Construye la ficha completa de un tripulante a partir de sus lecturas.
 * overrides.pvt_ms: PVT medido en la validación cognitiva del usuario actual.
 */
export function buildMember(user, index, readings, overrides = {}) {
  const { nutrition, ...readingOverrides } = overrides
  const seed = hashString(user.id)
  const rnd = seededRandom(seed)
  const r = { ...readings, ...readingOverrides }
  const exerciseMin = Math.round(92 + rnd() * 43 - (r.sleep_hours < 6 ? 28 : 0))

  const evaluated = evaluateModules(r, exerciseMin)
  // overrides.nutrition: análisis de la IA nutricional a bordo, que manda sobre la regla simple
  if (nutrition) evaluated.nut = nutrition
  const modules = {}
  for (const mod of MODULES) {
    const e = evaluated[mod.key]
    const series = weekSeries(mod, e.v, e.st, rnd)
    modules[mod.key] = { ...e, series, month: [...monthHistory(mod, rnd), ...series] }
  }

  const level = worstLevel(MODULES.map((m) => modules[m.key].st))
  const flagged = MODULES.filter((m) => modules[m.key].st > 0)
  const sensorIssues = MODULES.filter((m) => modules[m.key].st < 0)

  return {
    ...user,
    index,
    location: index % 3 === 0 ? 'EVA' : 'Ship',
    suitStripe: SUIT_STRIPES[seed % SUIT_STRIPES.length],
    mood: MOODS[Math.max(0, Math.min(4, Math.round(r.mood) - 1))],
    readings: r,
    water: { liters: r.water_l, glasses: Math.round(r.water_l * 4) },
    modules,
    level,
    flagged,
    sensorIssues,
  }
}

export const worstModuleLevel = (crew, key) => worstLevel(crew.map((c) => c.modules[key].st))

export const countFlagged = (crew, key) => crew.filter((c) => c.modules[key].st > 0).length

export { MODULE_BY_KEY }
