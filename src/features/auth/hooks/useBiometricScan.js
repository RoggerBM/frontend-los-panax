import { useCallback, useEffect, useRef, useState } from 'react'
import { GRANT_DELAY_MS, SCAN_DURATION_MS, SCAN_STEPS } from '../config/scan'

const TICK_MS = 60

/**
 * Máquina de estados del escaneo: idle -> scanning -> granted.
 * Cuando termina, espera `grantDelay` y llama a onComplete(user).
 */
export function useBiometricScan({
  duration = SCAN_DURATION_MS,
  grantDelay = GRANT_DELAY_MS,
  onComplete,
} = {}) {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])

  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const clearTimers = useCallback(() => {
    clearInterval(intervalRef.current)
    clearTimeout(timeoutRef.current)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setStatus('idle')
    setProgress(0)
    setLogs([])
  }, [clearTimers])

  const start = useCallback(
    (user) => {
      clearTimers()
      setStatus('scanning')
      setProgress(0)
      setLogs([])

      const startedAt = performance.now()
      let nextStep = 0

      intervalRef.current = setInterval(() => {
        const pct = Math.min(100, ((performance.now() - startedAt) / duration) * 100)
        setProgress(pct)

        const fresh = []
        while (nextStep < SCAN_STEPS.length && SCAN_STEPS[nextStep].at <= pct) {
          const step = SCAN_STEPS[nextStep]
          fresh.push({ id: nextStep, level: step.level, text: step.text(user), time: new Date() })
          nextStep += 1
        }
        if (fresh.length) setLogs((prev) => [...prev, ...fresh])

        if (pct >= 100) {
          clearInterval(intervalRef.current)
          setStatus('granted')
          timeoutRef.current = setTimeout(() => onCompleteRef.current?.(user), grantDelay)
        }
      }, TICK_MS)
    },
    [clearTimers, duration, grantDelay],
  )

  useEffect(() => clearTimers, [clearTimers])

  return { status, progress, logs, start, reset }
}
