import { useCallback, useEffect, useRef } from 'react'
import { useAnimatedCanvas } from '../hooks/useAnimatedCanvas'
import { createEcgState, drawEcgFrame } from '../lib/ecg'
import { Card, CardHeader } from './ui'

export default function EcgMonitor({ bpm, spo2 }) {
  const stateRef = useRef(createEcgState())

  useEffect(() => {
    stateRef.current.bpm = bpm
  }, [bpm])

  const draw = useCallback((ctx, w, h) => drawEcgFrame(ctx, w, h, stateRef.current), [])
  const canvasRef = useAnimatedCanvas(draw)

  return (
    <Card>
      <CardHeader title="Osciloscopio biométrico en vivo (ECG + SpO2)">
        <span className="text-[10px] text-brand">{spo2}</span>
      </CardHeader>
      <canvas
        ref={canvasRef}
        className="mt-1.5 block h-[82px] w-full rounded-md border border-brand-soft/15 bg-black/30"
      />
    </Card>
  )
}
