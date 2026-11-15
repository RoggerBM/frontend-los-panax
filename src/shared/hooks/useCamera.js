import { useCallback, useEffect, useRef, useState } from 'react'

const ERROR_MESSAGES = {
  NotAllowedError: 'Camera permission denied. Enable it in your browser and try again.',
  NotFoundError: 'No camera was found.',
  NotReadableError: 'The camera is being used by another application.',
  OverconstrainedError: 'The camera does not support the requested settings.',
}

const CONSTRAINTS = {
  audio: false,
  video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
}

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

/**
 * Controla la cámara del usuario.
 * status: 'off' | 'requesting' | 'on' | 'error'
 * Asigna `videoRef` a un <video autoPlay playsInline muted />.
 */
export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const requestIdRef = useRef(0)
  const [status, setStatus] = useState('off')
  const [error, setError] = useState(null)

  const stop = useCallback(() => {
    requestIdRef.current += 1 // invalida cualquier solicitud pendiente
    stopStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('off')
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot use the camera (https or localhost is required).')
      setStatus('error')
      return false
    }

    const requestId = ++requestIdRef.current
    stopStream(streamRef.current)
    setError(null)
    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS)
      if (requestId !== requestIdRef.current) {
        stopStream(stream) // se canceló mientras se pedía permiso
        return false
      }
      streamRef.current = stream
      setStatus('on')
      return true
    } catch (err) {
      if (requestId !== requestIdRef.current) return false
      setError(ERROR_MESSAGES[err?.name] ?? 'Could not access the camera.')
      setStatus('error')
      return false
    }
  }, [])

  // Conecta el stream al <video> cuando ya está montado
  useEffect(() => {
    if (status === 'on' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [status])

  // Apaga la cámara al desmontar
  useEffect(
    () => () => {
      requestIdRef.current += 1
      stopStream(streamRef.current)
    },
    [],
  )

  return { videoRef, status, error, start, stop }
}
