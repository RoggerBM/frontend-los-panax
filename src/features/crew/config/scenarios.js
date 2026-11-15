/**
 * Lecturas base por escenario. Son las mismas que usa el backend (backend/app/telemetry/scenarios.py)
 * y sirven de respaldo cuando no hay conexión con él.
 */
export const BASE_READINGS = {
  nominal: {
    hr: 67, hrv: 56, bp_sys: 117, bp_dia: 75, t_core: 36.7, t_skin: 36.8, spo2: 99, resp: 14,
    sleep_hours: 7.2, mood: 4, kss: 3, light_k: 6500, dose_msv_day: 0.7, dose_a_ugy_h: 14.52,
    dose_b_ugy_h: 17.41, pvt_ms: 265, glucose: 92, water_l: 2.4, caloric_pct: 96, gravity_g: 0,
  },
  sensor: {
    hr: 74, hrv: 49, bp_sys: 121, bp_dia: 78, t_core: 36.8, t_skin: 38.1, spo2: 98, resp: 15,
    sleep_hours: 7.0, mood: 4, kss: 4, light_k: 6500, dose_msv_day: 0.72, dose_a_ugy_h: 14.8,
    dose_b_ugy_h: 17.5, pvt_ms: 278, glucose: 95, water_l: 2.3, caloric_pct: 94, gravity_g: 0,
  },
  solar: {
    hr: 112, hrv: 28, bp_sys: 138, bp_dia: 88, t_core: 38.6, t_skin: 38.5, spo2: 95, resp: 22,
    sleep_hours: 5.4, mood: 2, kss: 7, light_k: 2700, dose_msv_day: 4.85, dose_a_ugy_h: 98.4,
    dose_b_ugy_h: 112.0, pvt_ms: 365, glucose: 118, water_l: 1.7, caloric_pct: 88, gravity_g: 0,
  },
  mars: {
    hr: 88, hrv: 41, bp_sys: 104, bp_dia: 68, t_core: 37.0, t_skin: 37.1, spo2: 98, resp: 16,
    sleep_hours: 6.8, mood: 3, kss: 4, light_k: 6500, dose_msv_day: 1.15, dose_a_ugy_h: 23.9,
    dose_b_ugy_h: 23.9, pvt_ms: 295, glucose: 89, water_l: 2.6, caloric_pct: 93, gravity_g: 0.38,
  },
}

/**
 * Modos de demo. "mixed" reparte un escenario distinto a cada tripulante para que
 * la pantalla de inicio muestre estados variados; los demás aplican uno a toda la tripulación.
 */
export const DEMO_MODES = [
  { id: 'mixed', label: 'Mission in progress', desc: 'Each crew member in a different situation' },
  { id: 'nominal', label: 'All nominal', desc: 'Uneventful orbit' },
  { id: 'solar', label: 'Solar storm', desc: 'Particle event + fever across the whole crew' },
  { id: 'sensor', label: 'Sensor failure', desc: 'T2 thermistor drift: the reading is discarded, no false alarm' },
  { id: 'mars', label: 'Mars surface', desc: 'Transition to 0.38 g' },
]

const MIXED_ORDER = ['solar', 'nominal', 'sensor', 'mars']

export function scenarioFor(mode, index) {
  return mode === 'mixed' ? MIXED_ORDER[index % MIXED_ORDER.length] : mode
}

export const ENVIRONMENTS = ['Orbital Station', 'Transit Vehicle', 'Artemis Lunar Base', 'Mars Surface']
