import { useCallback, useRef } from 'react'
import { useAnimatedCanvas } from '@/shared/hooks/useAnimatedCanvas'

// Tres capas de profundidad: las lejanas son pequeñas, tenues y lentas
const LAYERS = [
  { density: 1 / 2600, size: [0.4, 0.9], alpha: [0.25, 0.6], speed: 0.006 },
  { density: 1 / 7000, size: [0.8, 1.4], alpha: [0.45, 0.85], speed: 0.014 },
  { density: 1 / 26000, size: [1.3, 2.1], alpha: [0.7, 1], speed: 0.028 },
]
// Algunas estrellas con un leve tinte (cian, azul, ámbar), el resto blancas
const TINTS = ['255,255,255', '255,255,255', '255,255,255', '200,230,255', '180,255,240', '255,236,200']

const rand = (a, b) => a + Math.random() * (b - a)
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function createStars(w, h, densityScale) {
  return LAYERS.flatMap((layer, depth) =>
    Array.from({ length: Math.round(w * h * layer.density * densityScale) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: rand(...layer.size),
      a: rand(...layer.alpha),
      tw: rand(0.6, 2.2), // velocidad de parpadeo
      ph: Math.random() * Math.PI * 2,
      speed: layer.speed,
      depth,
      tint: TINTS[Math.floor(Math.random() * TINTS.length)],
    })),
  )
}

/**
 * Fondo de estrellas animado. Por defecto va fijo detrás de todo el contenido;
 * con `className` se puede incrustar en un contenedor (p. ej. "absolute inset-0").
 * `density` multiplica la cantidad de estrellas (útil en contenedores pequeños).
 */
export default function Starfield({ className = 'fixed inset-0 -z-10', density = 1 }) {
  const state = useRef({ w: 0, h: 0, stars: [], t: 0, shooting: null, nextShot: 6 })

  const draw = useCallback((ctx, w, h) => {
    const s = state.current
    const still = reducedMotion()
    if (w !== s.w || h !== s.h) {
      s.stars = createStars(w, h, density)
      s.w = w
      s.h = h
    }
    s.t += 1 / 60

    // Nebulosas tenues (cian y cobalto) para dar profundidad
    const g1 = ctx.createRadialGradient(w * 0.18, h * 0.12, 0, w * 0.18, h * 0.12, Math.max(w, h) * 0.55)
    g1.addColorStop(0, 'rgba(56, 254, 220, 0.05)')
    g1.addColorStop(1, 'rgba(56, 254, 220, 0)')
    ctx.fillStyle = g1
    ctx.fillRect(0, 0, w, h)
    const g2 = ctx.createRadialGradient(w * 0.85, h * 0.8, 0, w * 0.85, h * 0.8, Math.max(w, h) * 0.6)
    g2.addColorStop(0, 'rgba(19, 46, 209, 0.08)')
    g2.addColorStop(1, 'rgba(19, 46, 209, 0)')
    ctx.fillStyle = g2
    ctx.fillRect(0, 0, w, h)

    for (const star of s.stars) {
      if (!still) {
        star.x -= star.speed
        star.y += star.speed * 0.35
        if (star.x < -2) star.x = w + 2
        if (star.y > h + 2) star.y = -2
      }
      const twinkle = still ? 1 : 0.65 + 0.35 * Math.sin(s.t * star.tw + star.ph)
      ctx.globalAlpha = star.a * twinkle
      ctx.fillStyle = `rgb(${star.tint})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()
      // Destello en cruz para las estrellas más cercanas y brillantes
      if (star.depth === 2 && star.r > 1.7) {
        ctx.globalAlpha = star.a * twinkle * 0.35
        ctx.fillRect(star.x - star.r * 3, star.y - 0.35, star.r * 6, 0.7)
        ctx.fillRect(star.x - 0.35, star.y - star.r * 3, 0.7, star.r * 6)
      }
    }
    ctx.globalAlpha = 1

    // Estrella fugaz ocasional
    if (!still) {
      s.nextShot -= 1 / 60
      if (!s.shooting && s.nextShot <= 0) {
        s.shooting = { x: rand(w * 0.3, w), y: rand(0, h * 0.4), life: 0 }
        s.nextShot = rand(7, 14)
      }
      if (s.shooting) {
        const sh = s.shooting
        sh.life += 1 / 60
        sh.x -= 9
        sh.y += 4
        const fade = Math.max(0, 1 - sh.life / 0.9)
        const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x + 90, sh.y - 40)
        grad.addColorStop(0, `rgba(220, 255, 250, ${0.9 * fade})`)
        grad.addColorStop(1, 'rgba(220, 255, 250, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(sh.x, sh.y)
        ctx.lineTo(sh.x + 90, sh.y - 40)
        ctx.stroke()
        if (fade <= 0) s.shooting = null
      }
    }
  }, [density])

  const canvasRef = useAnimatedCanvas(draw)

  return <canvas ref={canvasRef} className={`pointer-events-none h-full w-full ${className}`} aria-hidden />
}
