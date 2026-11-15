/**
 * Nutrición con IA a bordo (portado de space-qhealth-interfaz21.html).
 * Metas: NASA JSC-67378 (Nutritional Requirements for Exploration Missions up to 365 days):
 * energía individual (ecuaciones DRI), agua ≥2500 mL/d hombres y ≥2100 mL/d mujeres, vitamina D 25 µg/d.
 * Datos de la tripulación: SIMULADOS. Referencia real: ingesta ~80 % del requerimiento y pérdida de masa (Zwart 2014).
 */
import { hashString } from '@/shared/utils/math'

/** Colores por nivel (0 nominal · 1 precaución · 2 alerta), legibles sobre fondo oscuro. */
export const LEVEL_HEX = ['#50EF39', '#F5F557', '#FF6B6B']

export const LINKS = {
  on: { label: 'Online', delayMs: 2500, color: '#50EF39' },
  slow: { label: '14-min delay', delayMs: 12000, color: '#F5F557' },
  off: { label: 'No signal', delayMs: null, color: '#FF6B6B' },
}

// Perfil por posición: coincide con los escenarios del modo "Mission in progress"
// (0 tormenta solar → ingesta cayendo, 1 nominal → bien, 2 fallo de sensor → poca agua, 3 Marte → mucho ejercicio)
const PROFILES = ['drop', 'ok', 'water', 'eva']

/** Perfil nutricional simulado y estable para un tripulante. */
export function nutritionProfile(user, index) {
  const h = hashString(`${user.id}:nutrition`)
  const sex = h % 2 === 0 ? 'F' : 'M'
  return {
    id: user.id,
    name: user.name,
    sex,
    kg: sex === 'F' ? 58 + (h % 9) : 70 + (h % 13),
    kcal: sex === 'F' ? 2300 + (h % 5) * 50 : 2800 + (h % 7) * 50,
    seed: (h % 100000) + 1,
    profile: PROFILES[index % PROFILES.length],
  }
}

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** 30 días de registros: e energía (fracción de la meta), p proteína, w agua mL, vd vit. D, ap apetito, sk comidas omitidas, ex ejercicio, m masa. */
export function generateDays(a) {
  const r = rng(a.seed * 977 + 13)
  const days = []
  let m = a.kg
  for (let d = 0; d < 30; d += 1) {
    let e = 0.86 + (r() - 0.5) * 0.16
    let p = 0.9 + (r() - 0.5) * 0.2
    let w = (a.sex === 'M' ? 2600 : 2200) + (r() - 0.5) * 500
    let ap = 4
    let sk = 0
    let ex = 110 + (r() - 0.5) * 30
    if (a.profile === 'drop' && d >= 18) {
      const k = (d - 17) / 12
      e = 0.84 - 0.26 * k + (r() - 0.5) * 0.08
      p = 0.86 - 0.25 * k
      ap = r() < 0.5 ? 2 : 3
      sk = d >= 24 && r() < 0.6 ? 1 : 0
      w -= 250 * k
    }
    if (a.profile === 'eva') {
      ex = d % 6 === 0 ? 190 : 135 + (r() - 0.5) * 25
      e += 0.02
    }
    if (a.profile === 'water') w = 1650 + (r() - 0.5) * 350
    if (a.profile === 'ok') e += 0.05
    e = Math.max(0.35, Math.min(1.1, e))
    m += (-0.012 + (e - 0.92) * 0.09) * (1 + (r() - 0.5) * 0.4)
    days.push({
      e: +e.toFixed(3),
      p: +Math.max(0.3, p).toFixed(3),
      w: Math.round(w),
      vd: r() < 0.85 ? 25 : 0,
      ap,
      sk,
      ex: Math.round(ex),
      m: +m.toFixed(2),
    })
  }
  return days
}

const avg = (arr, k, n) => {
  const s = arr.slice(-n)
  return s.reduce((x, y) => x + y[k], 0) / s.length
}

/** Regresión lineal simple: y = a + b·x */
function fit(ys) {
  const n = ys.length
  const xm = (n - 1) / 2
  const ym = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  ys.forEach((y, i) => {
    num += (i - xm) * (y - ym)
    den += (i - xm) ** 2
  })
  const b = num / den
  return { b, a: ym - b * xm }
}

/** IA a bordo: análisis local y explicable (sin internet). st: 0 nominal · 1 precaución · 2 alerta */
export function analyze(a, D) {
  const wT = a.sex === 'M' ? 2500 : 2100
  const e7 = avg(D, 'e', 7)
  const p7 = avg(D, 'p', 7)
  const w7 = avg(D, 'w', 7)
  const ap3 = avg(D, 'ap', 3)
  const sk7 = D.slice(-7).reduce((s, x) => s + x.sk, 0)
  const vd7 = D.slice(-7).filter((x) => x.vd >= 25).length
  const ex7 = avg(D, 'ex', 7)
  const fe = fit(D.slice(-14).map((x) => x.e))
  const fm = fit(D.slice(-14).map((x) => x.m))
  const mPct = ((D[29].m - a.kg) / a.kg) * 100
  const m30 = fm.a + fm.b * (13 + 30)
  const m30Pct = ((m30 - a.kg) / a.kg) * 100
  const base = D.slice(0, 14).map((x) => x.e)
  const bm = base.reduce((s, x) => s + x, 0) / 14
  const bsd = Math.sqrt(base.reduce((s, x) => s + (x - bm) ** 2, 0) / 13) || 0.03
  const z = (e7 - bm) / bsd
  const C = [
    ['Low energy (7 days)', Math.max(0, Math.min(30, (0.9 - e7) * 100))],
    ['Downward trend', Math.max(0, Math.min(15, -fe.b * 700))],
    ['Body mass loss', Math.max(0, Math.min(20, -mPct * 5))],
    ['Not enough water', Math.max(0, Math.min(15, ((wT - w7) / wT) * 60))],
    ['Skipped meals', Math.min(10, sk7 * 3.5)],
    ['Low appetite', Math.max(0, Math.min(10, (3.5 - ap3) * 6))],
    ['High exercise not compensated', ex7 > 150 && e7 < 0.95 ? 8 : 0],
    ['Incomplete vitamin D', Math.min(6, (7 - vd7) * 1.5)],
  ]
  const risk = Math.round(Math.min(100, C.reduce((s, c) => s + c[1], 0)))
  const ec = e7 < 0.7 ? 2 : e7 < 0.85 ? 1 : 0
  const wc = w7 < wT * 0.75 ? 2 : w7 < wT * 0.9 ? 1 : 0
  const mc = mPct <= -4 ? 2 : mPct <= -2 ? 1 : 0
  const st = Math.max(risk >= 55 ? 2 : risk >= 30 ? 1 : 0, ec, wc, mc)
  return { a, D, wT, e7, p7, w7, ap3, sk7, vd7, ex7, fe, fm, mPct, m30Pct, z, C, risk, st, ec, wc, mc, kcal7: Math.round(e7 * a.kcal) }
}

/** Recomendaciones por reglas (requisitos NASA), ordenadas por prioridad. p: 0 info · 1 precaución · 2 alerta */
export function recommendations(R, done) {
  const L = []
  const a = R.a
  const def = Math.round(((0.95 - R.e7) * a.kcal) / 50) * 50
  if (R.e7 < 0.85)
    L.push({
      id: 'kcal',
      p: R.e7 < 0.7 ? 2 : 1,
      t: `Add ~${Math.max(200, def)} kcal today`,
      w: `Ate ${Math.round(R.e7 * 100)}% of the goal over 7 days (goal: ${a.kcal} kcal). ISS crews average ~80%, and below that mass, muscle and bone are lost.`,
      how: ['High-density snack: nuts, tortilla with peanut butter', 'Eat with the crew (it improves intake)', 'Use sauces and condiments: flavor is weaker in microgravity'],
    })
  if (R.fe.b < -0.006)
    L.push({
      id: 'trend',
      p: 1,
      t: 'Intake has been dropping every day',
      w: `It falls ${Math.abs(R.fe.b * 100).toFixed(1)} points per day over the last 2 weeks. At this rate, body mass would change ${R.m30Pct.toFixed(1)}% in 30 days.`,
      how: ['Check for nausea, stress or menu monotony', 'Pick favorite dishes from the inventory this week'],
    })
  if (R.w7 < R.wT * 0.9)
    L.push({
      id: 'water',
      p: R.w7 < R.wT * 0.75 ? 2 : 1,
      t: `Drink ${Math.round((R.wT - R.w7) / 250) * 250} mL more water today`,
      w: `Average of ${Math.round(R.w7)} mL/day; NASA's goal is ≥${R.wT} mL/day. Low water intake raises the risk of kidney stones in space.`,
      how: ['One 250 mL pouch with each meal and after exercise', 'Reminder every 2 h'],
    })
  if (R.sk7 >= 2)
    L.push({
      id: 'skip',
      p: 1,
      t: 'Do not skip meals this week',
      w: `Skipped ${R.sk7} meals in 7 days.`,
      how: ['Fix meals in the mission timeline', 'Report it if the cause is workload'],
    })
  if (R.ap3 < 3)
    L.push({
      id: 'app',
      p: 1,
      t: 'Low appetite: check mood and symptoms',
      w: `Average appetite ${R.ap3.toFixed(1)}/5 over 3 days. It often comes with stress, poor sleep or congestion from fluids shifting to the head.`,
      how: ['Do the mood and stress self-check', 'Small, frequent portions'],
    })
  if (R.ex7 > 150 && R.e7 < 0.95)
    L.push({
      id: 'eva',
      p: 1,
      t: 'Compensate exercise and EVA expenditure',
      w: `Average of ${Math.round(R.ex7)} min/day of activity: needs more energy and protein.`,
      how: ['Protein snack after each session', 'Carbohydrate drink before EVA'],
    })
  if (R.p7 < 0.85)
    L.push({
      id: 'prot',
      p: 1,
      t: 'Increase protein',
      w: `Ate ${Math.round(R.p7 * 100)}% of the protein goal. Low protein speeds up muscle loss.`,
      how: ['Add meat, egg or dairy from the menu in 2 meals'],
    })
  if (R.vd7 < 6)
    L.push({
      id: 'vitd',
      p: 0,
      t: "Take today's vitamin D",
      w: `Only ${R.vd7} of 7 days with the recommended 25 µg. Without sunlight, the body barely produces it.`,
      how: ['Take it with breakfast'],
    })
  if (!L.length)
    L.push({
      id: 'okk',
      p: 0,
      t: 'All good: keep the plan',
      w: `Energy ${Math.round(R.e7 * 100)}% · water ${Math.round(R.w7)} mL/day · mass ${R.mPct.toFixed(1)}%.`,
      how: ['Keep logging every meal'],
    })
  return L.filter((r) => !done.has(`${a.id}:${r.id}`)).sort((x, y) => y.p - x.p)
}

/** Asistente local: responde con los datos del tripulante calculados a bordo. */
export function answer(q, R, linkKey, done) {
  const a = R.a
  const s = q.toLowerCase()
  const top = recommendations(R, done)[0]
  if (/\b(eat|eating|food|meal|meals|lunch|dinner|breakfast|snack|hungry)\b/.test(s))
    return `Right now the best move is: ${top.t.toLowerCase()}. ${top.how[0]}. Averaging ${R.kcal7} kcal/day versus a goal of ${a.kcal}.`
  if (/\b(weight|mass|lost|lose|losing|thinner)\b/.test(s))
    return `Body mass changed ${R.mPct.toFixed(1)}% since before the flight. At the current trend it would be ${R.m30Pct.toFixed(1)}% in 30 days. Main cause according to the analysis: ${R.C.slice()
      .sort((x, y) => y[1] - x[1])[0][0]
      .toLowerCase()}.`
  if (/\b(water|drink|drinking|hydration|hydrated|thirst|thirsty)\b/.test(s))
    return `Averaging ${Math.round(R.w7)} mL/day and the goal is ≥${R.wT} mL. ${R.w7 < R.wT ? `About ${Math.round(R.wT - R.w7)} mL/day short.` : 'On track.'}`
  if (/\b(earth|doctor|nutritionist|notify|alert|surgeon)\b/.test(s))
    return `With the link at "${LINKS[linkKey].label}", ${
      linkKey === 'off'
        ? 'messages stay queued and go out automatically when the signal returns'
        : `the message reaches Earth in ${linkKey === 'slow' ? '14 min and the reply in ~28 min' : 'seconds'}`
    }. Meanwhile, the on-board AI keeps recommending.`
  if (/\b(why|risk|explain|reason)\b/.test(s))
    return `Risk ${R.risk}/100. Biggest contributors: ${R.C.filter((c) => c[1] > 0)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3)
      .map((c) => `${c[0].toLowerCase()} (${Math.round(c[1])})`)
      .join(', ')}.`
  return `I can answer about what to eat now, weight, water, the risk and when to notify Earth. Most important today: ${top.t.toLowerCase()}.`
}

/** Registro rápido: aplica una entrada al día de hoy y devuelve los días nuevos. */
export const LOG_ENTRIES = {
  meal: { de: 0.33, dp: 0.33, dw: 0, label: 'Full meal' },
  snack: { de: 0.1, dp: 0.12, dw: 0, label: 'Protein snack' },
  water: { de: 0, dp: 0, dw: 500, label: '500 mL of water' },
  skip: { de: 0, dp: 0, dw: 0, label: 'Skipped meal' },
}

export function applyLog(days, kind) {
  const M = LOG_ENTRIES[kind]
  const today = { ...days[29] }
  today.e = +Math.min(1.25, today.e + M.de).toFixed(3)
  today.p = +Math.min(1.3, today.p + M.dp).toFixed(3)
  today.w += M.dw
  if (kind === 'skip') {
    today.sk += 1
    today.ap = Math.max(1, today.ap - 1)
  }
  return [...days.slice(0, 29), today]
}
