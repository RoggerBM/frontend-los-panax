import { useCallback, useState } from 'react'

const storageKey = (userId) => `cognitive.history.${userId}`

function read(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) ?? {}
  } catch {
    return {}
  }
}

/**
 * Historial de resultados por usuario y prueba (localStorage).
 * El primer resultado de cada prueba es la línea base.
 */
export function useTestHistory(userId) {
  const [history, setHistory] = useState(() => read(userId))

  const save = useCallback(
    (testId, result) => {
      setHistory((prev) => {
        const next = { ...prev, [testId]: [...(prev[testId] ?? []), { ...result, date: Date.now() }] }
        try {
          localStorage.setItem(storageKey(userId), JSON.stringify(next))
        } catch {
          /* sin almacenamiento: el historial vive solo en memoria */
        }
        return next
      })
    },
    [userId],
  )

  return { history, save }
}
