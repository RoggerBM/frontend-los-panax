import { useCallback, useMemo, useRef, useState } from 'react'
import { getUsers } from '@/features/auth'
import { useFatigueResults } from '@/features/cognitive'
import { ENVIRONMENTS, scenarioFor } from '../config/scenarios'
import { useCrewTelemetry } from '../hooks/useCrewTelemetry'
import { buildMember, fallbackReadings } from '../lib/crewModel'
import { CrewContext } from './crewContext'

/** Estado compartido del panel de tripulación: datos en vivo, modo demo, entorno y avisos. */
export function CrewProvider({ children }) {
  const { results: fatigueResults } = useFatigueResults()
  const users = getUsers()

  const [demoMode, setDemoMode] = useState('mixed')
  const [environment, setEnvironment] = useState(ENVIRONMENTS[0])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const targets = useMemo(
    () => users.map((u, i) => ({ id: u.id, scenario: scenarioFor(demoMode, i) })),
    [users, demoMode],
  )
  const { readings, status: linkStatus } = useCrewTelemetry(targets)

  const crew = useMemo(
    () =>
      users.map((u, i) => {
        const r = readings[u.id] ?? fallbackReadings(u.id, targets[i].scenario)
        // Si el tripulante hizo el test de fatiga, se usa su PVT real en lugar del simulado
        const lastTest = fatigueResults[u.id] ?? null
        const pvt = lastTest?.times?.reaction
        const overrides = pvt ? { pvt_ms: Math.round(pvt) } : {}
        return { ...buildMember(u, i, r, overrides), lastTest, scenario: targets[i].scenario }
      }),
    [users, readings, targets, fatigueResults],
  )

  const showToast = useCallback((text) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const value = useMemo(
    () => ({
      crew,
      getMember: (id) => crew.find((c) => c.id === id) ?? null,
      linkStatus,
      demoMode,
      setDemoMode,
      environment,
      setEnvironment,
      toast,
      showToast,
    }),
    [crew, linkStatus, demoMode, environment, toast, showToast],
  )

  return <CrewContext.Provider value={value}>{children}</CrewContext.Provider>
}
