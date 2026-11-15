import { useEffect, useRef, useState } from 'react'
import Starfield from '@/shared/components/Starfield'
import { BODY_ZONES } from '../config/modules'
import { statusOf } from '../config/status'
import { createBody3D } from '../lib/body3d/scene'

const SCENE_STATUS = { 2: 'WARNING', 1: 'CAUTION', 0: 'NOMINAL', '-1': 'NODATA' }

/**
 * Persona 3D anatómica con traje de vuelo (malla MakeHuman). Arrastrar rota, rueda/pellizco hace zoom
 * y un clic en una parte del cuerpo o en un marcador selecciona ese sistema.
 * zoneLevels: { [zona]: nivel } · selected: zona o null · onSelect(zona)
 */
export default function Body3D({ zoneLevels, selected, onSelect, name, haloHex }) {
  const box = useRef(null)
  const api = useRef(null)
  const onSelectRef = useRef(onSelect)
  const [tip, setTip] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    try {
      api.current = createBody3D(box.current, {
        // Sin zona (toque en el vacío) -> "body", la vista de cuerpo completo
        onSelect: (id) => onSelectRef.current(id ?? 'body'),
        onHover: (id, x, y) => setTip(id ? { id, x, y } : null),
      })
      // El lienzo 3D (transparente) va por encima del campo de estrellas del visor
      Object.assign(api.current.canvas.style, { position: 'relative', zIndex: '1' })
    } catch {
      // Sin WebGL disponible
      setFailed(true)
    }
    return () => {
      api.current?.dispose()
      api.current = null
    }
  }, [])

  useEffect(() => {
    if (!api.current) return
    const zones = {}
    for (const [id, level] of Object.entries(zoneLevels)) {
      if (id === 'body') continue
      zones[id] = { label: BODY_ZONES[id].label, status: SCENE_STATUS[level], color: statusOf(level).hex }
    }
    api.current.setZones(zones)
  }, [zoneLevels])

  useEffect(() => {
    api.current?.setSelected(selected && selected !== 'body' ? selected : null)
  }, [selected])

  useEffect(() => {
    api.current?.setName(name ?? '')
  }, [name])

  useEffect(() => {
    if (haloHex) api.current?.setHalo(haloHex)
  }, [haloHex])

  const tipLevel = tip ? zoneLevels[tip.id] : null

  return (
    <div
      ref={box}
      className="relative h-[460px] w-full select-none overflow-hidden rounded-lg border border-line/70 bg-[radial-gradient(circle_at_50%_40%,#141d33_0%,#05080f_80%)]"
      aria-label="Interactive 3D model of the crew member"
    >
      <Starfield className="absolute inset-0" density={2.5} />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-400">
          Your browser has no WebGL enabled, so the 3D body cannot be shown.
        </p>
      )}
      {tip && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-line bg-void/90 px-2 py-1 text-xs"
          style={{ left: tip.x + 12, top: tip.y - 10 }}
        >
          <b className="text-slate-100">{BODY_ZONES[tip.id]?.label}</b>{' '}
          <span style={{ color: statusOf(tipLevel).fg }}>{statusOf(tipLevel).label}</span>
          <span className="text-slate-500"> · tap to view</span>
        </div>
      )}
    </div>
  )
}
