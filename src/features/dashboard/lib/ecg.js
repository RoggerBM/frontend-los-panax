import { COLORS, rgba } from '../config/colors'

const SAMPLES = 220

/** Forma de onda P-QRS-T aproximada para una fase [0,1). */
function ecgSample(phase) {
  const p = phase % 1
  if (p > 0.1 && p < 0.18) return -0.15 * Math.sin(((p - 0.1) / 0.08) * Math.PI)
  if (p >= 0.22 && p < 0.25) return 0.18 * ((p - 0.22) / 0.03)
  if (p >= 0.25 && p < 0.29) return -0.95 * Math.sin(((p - 0.25) / 0.04) * Math.PI)
  if (p >= 0.29 && p < 0.33) return 0.32 * Math.sin(((p - 0.29) / 0.04) * Math.PI)
  if (p >= 0.44 && p < 0.58) return -0.26 * Math.sin(((p - 0.44) / 0.14) * Math.PI)
  return (Math.random() - 0.5) * 0.02
}

export function createEcgState() {
  return { data: new Array(SAMPLES).fill(0), tick: 0, bpm: 67 }
}

export function drawEcgFrame(ctx, w, h, s) {
  // Rejilla
  ctx.strokeStyle = rgba(COLORS.soft, 0.07)
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  s.tick += 0.018 * (s.bpm / 67)
  s.data.push(ecgSample(s.tick))
  if (s.data.length > SAMPLES) s.data.shift()

  ctx.beginPath()
  s.data.forEach((v, i) => {
    const x = (i / (s.data.length - 1)) * w
    const y = h * 0.55 + v * (h * 0.36)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.strokeStyle = COLORS.soft
  ctx.lineWidth = 1.8
  ctx.shadowColor = COLORS.soft
  ctx.shadowBlur = 6
  ctx.stroke()
  ctx.shadowBlur = 0
}
