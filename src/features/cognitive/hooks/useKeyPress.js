import { useEffect, useRef } from 'react'

/** Escucha teclado global. El handler devuelve true si consumió la tecla. */
export function useKeyPress(handler, enabled = true) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return undefined
    const onKeyDown = (e) => {
      if (e.repeat) return
      if (handlerRef.current(e)) e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
