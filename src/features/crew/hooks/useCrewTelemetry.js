import { useEffect, useMemo, useState } from 'react'
import { isTelemetryApiEnabled, telemetryStreamUrl } from '../services/telemetryApi'

/**
 * Se suscribe al stream SSE de sensores del backend para cada tripulante.
 * targets: [{ id, scenario }]
 * Devuelve { readings: { [id]: lecturas | undefined }, status } donde status es
 * 'disabled' (sin API) | 'connecting' | 'live' | 'offline'.
 */
export function useCrewTelemetry(targets) {
  const enabled = isTelemetryApiEnabled() && targets.length > 0
  const signature = targets.map((t) => `${t.id}:${t.scenario}`).join('|')
  const [state, setState] = useState({ signature: null, readings: {}, errors: {} })

  useEffect(() => {
    if (!enabled) return undefined
    const sources = signature.split('|').map((entry) => {
      const [id, scenario] = entry.split(':')
      const source = new EventSource(telemetryStreamUrl(id, scenario))
      source.addEventListener('telemetry', (event) => {
        try {
          const { readings } = JSON.parse(event.data)
          setState((prev) => ({
            signature,
            readings: { ...(prev.signature === signature ? prev.readings : {}), [id]: readings },
            errors: { ...(prev.signature === signature ? prev.errors : {}), [id]: false },
          }))
        } catch {
          // evento malformado: el siguiente tick lo reemplaza
        }
      })
      // EventSource reintenta solo; mientras tanto se usan las lecturas de respaldo
      source.onerror = () =>
        setState((prev) => ({
          signature,
          readings: prev.signature === signature ? prev.readings : {},
          errors: { ...(prev.signature === signature ? prev.errors : {}), [id]: true },
        }))
      return source
    })
    return () => sources.forEach((s) => s.close())
  }, [enabled, signature])

  return useMemo(() => {
    if (!enabled) return { readings: {}, status: 'disabled' }
    const current = state.signature === signature
    const readings = current ? state.readings : {}
    const errors = current ? state.errors : {}
    const ids = targets.map((t) => t.id)
    const status = ids.every((id) => readings[id] && !errors[id])
      ? 'live'
      : ids.some((id) => errors[id])
        ? 'offline'
        : 'connecting'
    return { readings, status }
    // targets se representa con `signature`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, signature, state])
}
