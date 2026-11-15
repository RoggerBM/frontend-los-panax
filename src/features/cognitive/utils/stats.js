export const randomBetween = (min, max) => min + Math.random() * (max - min)

export const pick = (items) => items[Math.floor(Math.random() * items.length)]

export function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function mean(values) {
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

export function median(values) {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export function formatMetric(metric, value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${value.toFixed(metric.decimals ?? 0)}${metric.unit ? ` ${metric.unit}` : ''}`
}
