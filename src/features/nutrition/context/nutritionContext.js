import { createContext, useContext } from 'react'

export const NutritionContext = createContext(null)

export function useNutrition() {
  const ctx = useContext(NutritionContext)
  if (!ctx) throw new Error('useNutrition debe usarse dentro de <NutritionProvider>')
  return ctx
}
