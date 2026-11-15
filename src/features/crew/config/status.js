import { AlertTriangle, Check, Settings2, X } from 'lucide-react'

/**
 * Niveles de estado (igual que en Livorbit):
 * -1 sensor (dato descartado, no es alerta clínica) · 0 nominal · 1 revisión · 2 crítico
 * Colores de la paleta AEGIS.
 */
// hex: bordes, puntos y fondos · fg: texto (el rojo AEGIS #C51111 no se lee como texto sobre fondo oscuro)
export const STATUS = {
  '-1': { label: 'Check sensor', short: 'SENSOR', hex: '#38FEDC', fg: '#38FEDC', icon: Settings2 },
  0: { label: 'Nominal', short: 'NOMINAL', hex: '#50EF39', fg: '#50EF39', icon: Check },
  1: { label: 'Review', short: 'REVIEW', hex: '#F5F557', fg: '#F5F557', icon: AlertTriangle },
  2: { label: 'Critical', short: 'CRITICAL', hex: '#C51111', fg: '#FF6B6B', icon: X },
}

export const statusOf = (level) => STATUS[level] ?? STATUS[0]

/** Peor estado clínico de una lista (el -1 de sensor no cuenta como alerta). */
export const worstLevel = (levels) => Math.max(0, ...levels)

/** Estilo de fondo/borde translúcidos y texto legible para un estado. */
export const tint = (status, bg = 0.13, border = 0.55) => ({
  backgroundColor: `${status.hex}${Math.round(bg * 255).toString(16).padStart(2, '0')}`,
  borderColor: `${status.hex}${Math.round(border * 255).toString(16).padStart(2, '0')}`,
  color: status.fg,
})
