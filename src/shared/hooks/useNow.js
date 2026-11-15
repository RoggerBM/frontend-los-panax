import { useEffect, useState } from 'react'

/** Devuelve la fecha actual y se actualiza cada `interval` ms. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])

  return now
}
