import { Palette, TrafficCone, Zap } from 'lucide-react'

export const STROOP_COLORS = [
  { id: 'red', label: 'Red', hex: '#EF4444', key: '1' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6', key: '2' },
  { id: 'green', label: 'Green', hex: '#22C55E', key: '3' },
  { id: 'yellow', label: 'Yellow', hex: '#FACC15', key: '4' },
]

/**
 * better: 'lower' | 'higher' — qué dirección es una mejora frente a la línea base.
 * headline: métrica que se muestra como resumen.
 */
export const TESTS = {
  pvt: {
    id: 'pvt',
    tag: 'PVT',
    name: 'Simple reaction',
    icon: Zap,
    duration: '≈ 40 s',
    description: 'Measures alertness. It is the most sensitive to sleep loss.',
    instructions: [
      'Watch the central circle.',
      'When it lights up, press as fast as you can.',
      'Do not jump the gun: pressing early counts as a false start.',
    ],
    keyHint: 'Space bar or tap the circle',
    params: { trials: 12, isiMin: 1500, isiMax: 4000, timeoutMs: 2000, lapseMs: 500 },
    headline: 'medianRt',
    metrics: [
      { key: 'medianRt', label: 'Median RT', unit: 'ms', better: 'lower' },
      { key: 'meanRt', label: 'Mean RT', unit: 'ms', better: 'lower' },
      { key: 'lapses', label: 'Lapses (>500 ms)', unit: '', better: 'lower' },
      { key: 'falseStarts', label: 'False starts', unit: '', better: 'lower' },
    ],
  },
  gonogo: {
    id: 'gonogo',
    tag: 'Go/No-Go',
    name: 'Color decision',
    icon: TrafficCone,
    duration: '≈ 35 s',
    description: 'Measures speed and impulsivity: press only on green, never on red.',
    instructions: ['A green or red circle will appear.', 'GREEN: press as fast as you can.', 'RED: do not press.'],
    keyHint: 'Space bar or tap the circle',
    params: { trials: 24, goRatio: 0.75, isiMin: 500, isiMax: 1000, timeoutMs: 700 },
    headline: 'accuracy',
    metrics: [
      { key: 'accuracy', label: 'Accuracy', unit: '%', better: 'higher' },
      { key: 'meanRt', label: 'Mean RT (green)', unit: 'ms', better: 'lower' },
      { key: 'commissions', label: 'Pressed on red', unit: '', better: 'lower' },
      { key: 'omissions', label: 'Missed green', unit: '', better: 'lower' },
    ],
  },
  stroop: {
    id: 'stroop',
    tag: 'Stroop',
    name: 'Word vs. color',
    icon: Palette,
    duration: '≈ 30 s',
    description: 'Measures cognitive control. It improves with practice, so use it as a spot check.',
    instructions: [
      'You will see a color name printed in a different ink color.',
      'Answer the INK COLOR, not the word.',
      'Use the buttons or keys 1 to 4.',
    ],
    keyHint: 'Keys 1 · 2 · 3 · 4 or tap the button',
    params: { trials: 16, congruentRatio: 0.5, isiMin: 400, isiMax: 700, timeoutMs: 3000 },
    headline: 'interference',
    metrics: [
      { key: 'accuracy', label: 'Accuracy', unit: '%', better: 'higher' },
      { key: 'meanCongruent', label: 'Congruent RT', unit: 'ms', better: 'lower' },
      { key: 'meanIncongruent', label: 'Incongruent RT', unit: 'ms', better: 'lower' },
      { key: 'interference', label: 'Stroop effect', unit: 'ms', better: 'lower' },
    ],
  },
}

export const TEST_LIST = Object.values(TESTS)
