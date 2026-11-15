const pad = (n) => String(n).padStart(2, '0')

/** HH:MM:SS en UTC */
export function formatClock(date) {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

/** Tiempo transcurrido de misión: T+HH:MM:SS */
export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `T+${pad(h)}:${pad(m)}:${pad(s)}`
}

export function formatNumber(value, decimals = 0) {
  return value.toFixed(decimals)
}
