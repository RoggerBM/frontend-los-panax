import { useCallback, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useAnimatedCanvas } from '@/shared/hooks/useAnimatedCanvas'
import { createEcgState, drawEcgFrame } from '../lib/ecg'

/** Trazado ECG animado. lost = señal perdida (falla de electrodo). */
export default function EcgStrip({ bpm, color = '#50EF39', grid = false, lost = false, className }) {
  const stateRef = useRef(createEcgState())

  useEffect(() => {
    Object.assign(stateRef.current, { bpm, color, grid, lost })
  }, [bpm, color, grid, lost])

  const draw = useCallback((ctx, w, h) => drawEcgFrame(ctx, w, h, stateRef.current), [])
  const canvasRef = useAnimatedCanvas(draw)

  return <canvas ref={canvasRef} className={clsx('block', className)} aria-hidden />
}
