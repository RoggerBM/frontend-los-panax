import { useCallback, useEffect, useState } from 'react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Lectura en voz alta en español (Web Speech API). */
export function useVoiceCopilot() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const msg = new SpeechSynthesisUtterance(text)
    msg.lang = 'es-ES'
    msg.rate = 1.03
    msg.onend = () => setSpeaking(false)
    msg.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(msg)
  }, [])

  useEffect(() => () => supported && window.speechSynthesis.cancel(), [])

  return { supported, speaking, speak }
}
