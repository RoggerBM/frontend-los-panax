import { useCallback, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { CALLOUT_PROTOCOLS, SCANNER_MODES } from '../config/scenarios'
import { useAnimatedCanvas } from '../hooks/useAnimatedCanvas'
import { createHoloState, drawHoloFrame } from '../lib/holoEngine'

const CALLOUT_POSITIONS = {
  cns: 'left-2.5 top-3',
  rad: 'right-2.5 top-3',
  cardio: 'bottom-3 left-2.5',
  metab: 'bottom-3 right-2.5',
}

/**
 * Bio-escáner holográfico 3D. Se puede rotar arrastrando.
 * callouts: { cns, rad, cardio, metab } -> texto de cada etiqueta
 */
export default function HoloScanner({ mode, onModeChange, accent, callouts, selected, onSelect, envLabel }) {
  const stateRef = useRef(createHoloState())
  const dragRef = useRef(null)

  useEffect(() => {
    stateRef.current.mode = mode
  }, [mode])

  useEffect(() => {
    stateRef.current.accent = accent
  }, [accent])

  const draw = useCallback((ctx, w, h) => drawHoloFrame(ctx, w, h, stateRef.current), [])
  const canvasRef = useAnimatedCanvas(draw)

  const handlePointerDown = (e) => {
    if (e.target.closest('[data-callout]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY }
    stateRef.current.autoRotate = false
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current) return
    const s = stateRef.current
    s.rotY += (e.clientX - dragRef.current.x) * 0.012
    s.rotX = Math.max(-0.65, Math.min(0.65, s.rotX + (e.clientY - dragRef.current.y) * 0.008))
    dragRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const handleCallout = (key) => {
    const s = stateRef.current
    s.autoRotate = false
    s.rotY = CALLOUT_PROTOCOLS[key].rotY
    onSelect(key)
  }

  return (
    <div className="relative flex min-h-[390px] flex-col justify-between gap-2 overflow-hidden rounded-xl border border-brand/45 bg-[radial-gradient(circle_at_50%_52%,rgb(79_70_229/0.16)_0%,rgb(0_0_0/0.35)_75%)] px-3.5 py-3">
      <div className="z-10 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-brand-soft">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-brand-soft shadow-[0_0_8px_rgb(99_102_241)]" />
          BIO-ESCÁNER HOLOGRÁFICO 3D
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SCANNER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={clsx(
                'rounded border px-2.5 py-1 text-[11px] transition-colors',
                mode === m.id
                  ? 'border-brand bg-brand/15 font-semibold text-brand-soft'
                  : 'border-brand/20 bg-black/30 text-paper/60 hover:border-brand hover:text-brand-soft',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative h-[320px] cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {Object.entries(CALLOUT_POSITIONS).map(([key, pos]) => (
          <button
            key={key}
            type="button"
            data-callout
            onClick={() => handleCallout(key)}
            className={clsx(
              'absolute z-10 rounded-md border bg-ink/85 px-2.5 py-1.5 text-left text-[10px] leading-snug backdrop-blur transition-all hover:-translate-y-px',
              pos,
              selected === key
                ? 'border-brand shadow-[0_0_14px_rgb(99_102_241/0.4)]'
                : 'border-brand/35 hover:border-brand',
            )}
          >
            <span className="block font-bold tracking-wide text-brand-soft">{CALLOUT_PROTOCOLS[key].head}</span>
            <span className="block text-paper">{callouts[key]}</span>
          </button>
        ))}
      </div>

      <div className="z-10 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-paper/60">
        <span>Arrastra para rotar • Clic en etiquetas para ver el protocolo</span>
        <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[9.5px] text-brand-soft">
          TELEMETRÍA EDGE VERIFICADA • {envLabel}
        </span>
      </div>
    </div>
  )
}
