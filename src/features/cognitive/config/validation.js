import { TESTS } from './tests'

/** Bloques del test de fatiga combinado, en orden. Ajusta `trials` para hacerlo más corto o largo. */
export const VALIDATION_BLOCKS = [
  {
    id: 'pvt',
    params: { ...TESTS.pvt.params, trials: 8 },
    hint: 'Press as soon as the circle lights up. Do not jump the gun.',
  },
  {
    id: 'gonogo',
    params: { ...TESTS.gonogo.params, trials: 16 },
    hint: 'Press only on GREEN. Do not press on RED.',
  },
  {
    id: 'stroop',
    params: { ...TESTS.stroop.params, trials: 10 },
    hint: 'Answer the INK COLOR, not the word (keys 1–4).',
  },
]

export const VALIDATION_DURATION = '≈ 1 min'

/**
 * Umbrales orientativos (no clínicos). Ajusta según tu protocolo.
 * Métricas donde "más es peor": >= caution -> precaución, >= fail -> no apto.
 * Precisión ("menos es peor"): < caution -> precaución, < fail -> no apto.
 */
export const THRESHOLDS = {
  pvtMedianRt: { caution: 350, fail: 450 }, // ms
  pvtLapses: { caution: 2, fail: 3 }, // de 8 ensayos
  gonogoCommissions: { caution: 2, fail: 3 }, // de 4 rojos
  stroopAccuracy: { caution: 80, fail: 60 }, // %
  baselineSlowdown: 1.2, // 20 % más lento que la línea base -> precaución
}
