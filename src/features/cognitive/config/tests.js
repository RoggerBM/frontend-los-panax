import { Palette, TrafficCone, Zap } from 'lucide-react'

export const STROOP_COLORS = [
  { id: 'rojo', label: 'Rojo', hex: '#EF4444', key: '1' },
  { id: 'azul', label: 'Azul', hex: '#3B82F6', key: '2' },
  { id: 'verde', label: 'Verde', hex: '#22C55E', key: '3' },
  { id: 'amarillo', label: 'Amarillo', hex: '#FACC15', key: '4' },
]

/**
 * better: 'lower' | 'higher' — indica qué dirección es una mejora frente a la línea base.
 * headline: métrica que se muestra como resumen en el panel.
 */
export const TESTS = {
  pvt: {
    id: 'pvt',
    tag: 'PVT',
    name: 'Reacción simple',
    icon: Zap,
    duration: '≈ 40 s',
    description: 'Mide el estado de alerta. Es la más sensible a la falta de sueño.',
    instructions: [
      'Mira el círculo central.',
      'Cuando se ilumine, pulsa lo más rápido posible.',
      'No te adelantes: pulsar antes cuenta como anticipación.',
    ],
    keyHint: 'Barra espaciadora o toca el círculo',
    params: { trials: 12, isiMin: 1500, isiMax: 4000, timeoutMs: 2000, lapseMs: 500 },
    headline: 'medianRt',
    metrics: [
      { key: 'medianRt', label: 'TR mediano', unit: 'ms', better: 'lower' },
      { key: 'meanRt', label: 'TR medio', unit: 'ms', better: 'lower' },
      { key: 'lapses', label: 'Lapsos (>500 ms)', unit: '', better: 'lower' },
      { key: 'falseStarts', label: 'Anticipaciones', unit: '', better: 'lower' },
    ],
  },
  gonogo: {
    id: 'gonogo',
    tag: 'Go/No-Go',
    name: 'Decisión de color',
    icon: TrafficCone,
    duration: '≈ 35 s',
    description: 'Mide velocidad e impulsividad: pulsar solo con verde, nunca con rojo.',
    instructions: [
      'Aparecerá un círculo verde o rojo.',
      'VERDE: pulsa lo más rápido posible.',
      'ROJO: no pulses.',
    ],
    keyHint: 'Barra espaciadora o toca el círculo',
    params: { trials: 24, goRatio: 0.75, isiMin: 500, isiMax: 1000, timeoutMs: 700 },
    headline: 'accuracy',
    metrics: [
      { key: 'accuracy', label: 'Precisión', unit: '%', better: 'higher' },
      { key: 'meanRt', label: 'TR medio (verde)', unit: 'ms', better: 'lower' },
      { key: 'commissions', label: 'Pulsó en rojo', unit: '', better: 'lower' },
      { key: 'omissions', label: 'Dejó pasar verde', unit: '', better: 'lower' },
    ],
  },
  stroop: {
    id: 'stroop',
    tag: 'Stroop',
    name: 'Palabra vs. color',
    icon: Palette,
    duration: '≈ 30 s',
    description:
      'Mide control mental. Mejora con la práctica, así que úsala como prueba puntual.',
    instructions: [
      'Verás el nombre de un color escrito con otro color de tinta.',
      'Responde el COLOR DE LA TINTA, no la palabra.',
      'Usa los botones o las teclas 1 a 4.',
    ],
    keyHint: 'Teclas 1 · 2 · 3 · 4 o toca el botón',
    params: { trials: 16, congruentRatio: 0.5, isiMin: 400, isiMax: 700, timeoutMs: 3000 },
    headline: 'interference',
    metrics: [
      { key: 'accuracy', label: 'Precisión', unit: '%', better: 'higher' },
      { key: 'meanCongruent', label: 'TR congruente', unit: 'ms', better: 'lower' },
      { key: 'meanIncongruent', label: 'TR incongruente', unit: 'ms', better: 'lower' },
      { key: 'interference', label: 'Efecto Stroop', unit: 'ms', better: 'lower' },
    ],
  },
}

export const TEST_LIST = Object.values(TESTS)
