import { TESTS } from './tests'

/** Bloques de la validación combinada, en orden. Ajusta `trials` para hacerla más corta o larga. */
export const VALIDATION_BLOCKS = [
  {
    id: 'pvt',
    params: { ...TESTS.pvt.params, trials: 8 },
    hint: 'Pulsa en cuanto el círculo se ilumine. No te adelantes.',
  },
  {
    id: 'gonogo',
    params: { ...TESTS.gonogo.params, trials: 16 },
    hint: 'Pulsa solo con VERDE. Con ROJO no pulses.',
  },
  {
    id: 'stroop',
    params: { ...TESTS.stroop.params, trials: 10 },
    hint: 'Responde el COLOR DE LA TINTA, no la palabra (teclas 1–4).',
  },
]

export const VALIDATION_DURATION = '≈ 1 min'

/**
 * Umbrales orientativos (no clínicos). Ajusta según tu protocolo.
 * Para métricas donde "más es peor": >= caution -> precaución, >= fail -> no apto.
 * Para la precisión ("menos es peor"): < caution -> precaución, < fail -> no apto.
 */
export const THRESHOLDS = {
  pvtMedianRt: { caution: 350, fail: 450 }, // ms
  pvtLapses: { caution: 2, fail: 3 }, // de 8 ensayos
  gonogoCommissions: { caution: 2, fail: 3 }, // de 4 rojos
  stroopAccuracy: { caution: 80, fail: 60 }, // %
  baselineSlowdown: 1.2, // 20 % más lento que la línea base -> precaución
}

/** Si es true, un resultado "No apto" no permite entrar al panel. */
export const BLOCK_ON_FAIL = true
