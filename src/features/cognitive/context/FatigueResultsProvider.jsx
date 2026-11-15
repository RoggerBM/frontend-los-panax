import { useCallback, useMemo, useState } from 'react'
import { FatigueResultsContext } from './fatigueResultsContext'

const STORAGE_KEY = 'fatigue.latest'

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

/** Último resultado del test de fatiga de cada tripulante (persistido en localStorage). */
export default function FatigueResultsProvider({ children }) {
  const [results, setResults] = useState(read)

  const saveResult = useCallback((crewId, result) => {
    setResults((prev) => {
      const next = { ...prev, [crewId]: result }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* sin almacenamiento: los resultados viven solo en memoria */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ results, saveResult }), [results, saveResult])
  return <FatigueResultsContext.Provider value={value}>{children}</FatigueResultsContext.Provider>
}
