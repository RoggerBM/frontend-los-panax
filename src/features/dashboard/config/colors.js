/** Colores en hex para canvas (no usan clases de Tailwind). Basados en la paleta del proyecto. */
export const COLORS = {
  brand: '#4F46E5',
  soft: '#6366F1',
  ink: '#1F2937',
  paper: '#E0E7FF',
  amber: '#F5A623',
  red: '#FF4D6A',
}

export function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** Tonos semánticos: ok (verde), info (verde suave), warn (ámbar), danger (rojo). */
export const TONE_HEX = {
  ok: COLORS.brand,
  info: COLORS.soft,
  warn: COLORS.amber,
  danger: COLORS.red,
}

export const TONE_CLASSES = {
  ok: { text: 'text-brand', badge: 'border-brand/40 bg-brand/15 text-brand', bg: 'bg-brand' },
  info: { text: 'text-brand-soft', badge: 'border-brand-soft/40 bg-brand-soft/10 text-brand-soft', bg: 'bg-brand-soft' },
  warn: { text: 'text-amber-400', badge: 'border-amber-400/40 bg-amber-400/15 text-amber-300', bg: 'bg-amber-400' },
  danger: { text: 'text-rose-400', badge: 'border-rose-500/45 bg-rose-500/15 text-rose-300', bg: 'bg-rose-500' },
}
