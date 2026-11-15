import { createContext, useContext } from 'react'

export const CrewContext = createContext(null)

export function useCrew() {
  const ctx = useContext(CrewContext)
  if (!ctx) throw new Error('useCrew debe usarse dentro de <CrewProvider>')
  return ctx
}
