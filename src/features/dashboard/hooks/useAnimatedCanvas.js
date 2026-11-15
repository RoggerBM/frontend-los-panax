import { useEffect, useRef } from 'react'

/**
 * Canvas con bucle requestAnimationFrame y ajuste automático a su tamaño CSS (HiDPI).
 * draw(ctx, width, height) se llama en cada frame con el canvas ya limpio.
 */
export function useAnimatedCanvas(draw) {
  const canvasRef = useRef(null)
  const drawRef = useRef(draw)

  useEffect(() => {
    drawRef.current = draw
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let frame
    const loop = () => {
      ctx.clearRect(0, 0, width, height)
      drawRef.current(ctx, width, height)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return canvasRef
}
