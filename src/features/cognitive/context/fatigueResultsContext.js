import { createContext, useContext } from 'react'

export const FatigueResultsContext = createContext(null)

/** { results: { [crewId]: { verdict, times, at, verifiedAt } }, saveResult(crewId, result) } */
export function useFatigueResults() {
  const ctx = useContext(FatigueResultsContext)
  if (!ctx) throw new Error('useFatigueResults debe usarse dentro de <FatigueResultsProvider>')
  return ctx
}
