import { BedDouble, Brain, Dumbbell, HeartPulse, Radiation, ShieldPlus, Utensils } from 'lucide-react'

/**
 * Los 7 módulos biomédicos (Livorbit). b = valor normal, sd = dispersión, d = decimales.
 * zone = sistema del cuerpo 3D donde se ubica el módulo.
 */
export const MODULES = [
  {
    key: 'cardio',
    name: 'Cardiovascular',
    icon: HeartPulse,
    metric: 'Resting heart rate',
    unit: 'bpm',
    b: 68,
    sd: 5,
    d: 0,
    zone: 'heart',
    hrp: 'Cardiovascular Adaptations',
    info: 'In microgravity, fluids shift toward the head and the heart adapts. A high, sustained resting heart rate can signal stress, dehydration or a rhythm problem.',
    todo: ['Rest 10 min and measure again', 'Drink 500 ml of water', 'If it stays high in 2 readings, notify Earth'],
  },
  {
    key: 'rad',
    name: 'Radiation',
    icon: Radiation,
    metric: 'Daily dose',
    unit: 'mSv',
    b: 0.5,
    sd: 0.06,
    d: 2,
    zone: 'body',
    hrp: 'Radiation-Induced Cancers',
    info: 'Outside the atmosphere, the crew receives high-energy particles. The dose rises during EVA, over the South Atlantic Anomaly and during solar storms.',
    todo: ['Avoid non-essential EVAs', 'Stay in the most shielded modules', 'During a solar storm: go to the shelter and notify Earth'],
  },
  {
    key: 'inm',
    name: 'Immune',
    icon: ShieldPlus,
    metric: 'Temperature',
    unit: '°C',
    b: 36.6,
    sd: 0.2,
    d: 1,
    zone: 'immune',
    hrp: 'Altered Immune System Responses',
    info: 'The immune system weakens with stress, poor sleep and radiation. Fever or rashes are early warning signs.',
    todo: ['Measure again in 30 min', 'Rest and hydrate', 'If it persists for more than 24 h, notify Earth'],
  },
  {
    key: 'fat',
    name: 'Fatigue & Sleep',
    icon: BedDouble,
    metric: 'Sleep',
    unit: 'h',
    b: 7,
    sd: 0.5,
    d: 1,
    zone: 'eyes',
    hrp: 'Inadequate Sleep and Irregular Schedules',
    info: 'Sleep loss and circadian misalignment increase errors in critical tasks.',
    todo: ['Take a 20-min power nap', 'Postpone critical tasks', 'No EVA or equipment operation until recovered'],
  },
  {
    key: 'con',
    name: 'Behavioral',
    icon: Brain,
    metric: 'Mood',
    unit: '/5',
    b: 4,
    sd: 0.4,
    d: 1,
    zone: 'mind',
    hrp: 'Behavioral Changes and Psychiatric Disorders',
    info: 'Isolation and confinement affect mood and crew dynamics, and the risk grows with mission length.',
    todo: ['Shared activity with the crew', 'Private call with Earth', 'Daily mood tracking'],
  },
  {
    key: 'act',
    name: 'Physical Activity',
    icon: Dumbbell,
    metric: 'Exercise',
    unit: 'min',
    b: 120,
    sd: 12,
    d: 0,
    zone: 'muscle',
    hrp: 'Reduced Musculoskeletal Fitness',
    info: 'Without gravity, muscle and bone are lost. The goal is about 120 min of exercise per day.',
    todo: ['Complete the pending session', 'Log the routine', 'Report pain or impacts'],
  },
  {
    key: 'nut',
    name: 'Nutrition & Glucose',
    icon: Utensils,
    metric: 'Intake',
    unit: '% goal',
    b: 100,
    sd: 7,
    d: 0,
    zone: 'metabolism',
    hrp: 'Inadequate Food and Nutrition',
    info: 'People eat less in space: food tastes bland and appetite drops. Eating too little speeds up muscle and bone loss.',
    todo: ['Extra snack and condiments', 'Eat with the crew', 'If weight drops, notify Earth'],
  },
]

export const MODULE_BY_KEY = Object.fromEntries(MODULES.map((m) => [m.key, m]))

/**
 * Sistemas del cuerpo 3D (lib/body3d) y los módulos que agrupan.
 * "body" no es una zona de la malla: la radiación afecta a todo el cuerpo.
 */
export const BODY_ZONES = {
  mind: { label: 'Mind', fn: 'Mood, stress and alertness.', modules: ['con'] },
  eyes: { label: 'Eyes & Sleep', fn: 'Vision (SANS), sleep and reaction time.', modules: ['fat'] },
  heart: { label: 'Heart', fn: 'Heart rate, blood pressure and variability.', modules: ['cardio'] },
  lungs: { label: 'Lungs', fn: 'Oxygenation and respiratory rate.', modules: ['cardio'] },
  metabolism: { label: 'Metabolism', fn: 'Glucose, intake and hydration.', modules: ['nut'] },
  immune: { label: 'Immune system', fn: 'Core temperature and defenses.', modules: ['inm'] },
  muscle: { label: 'Muscle', fn: 'Muscle mass and exercise load.', modules: ['act'] },
  bones: { label: 'Bones', fn: 'Bone preservation through impact and resistance.', modules: ['act'] },
  body: { label: 'Whole body', fn: 'Radiation dose absorbed by the body.', modules: ['rad'] },
}

/** Color de cada tripulante en los gráficos comparativos. */
export const CREW_COLORS = ['#38FEDC', '#F5F557', '#EF7D0D', '#A99BF7', '#50EF39', '#FF8AD8']

export const formatValue = (v, d) =>
  v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
