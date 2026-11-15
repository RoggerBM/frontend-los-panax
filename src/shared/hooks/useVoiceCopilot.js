import { useCallback, useEffect, useState } from 'react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
const LANG = 'en-US'

/** Primera voz instalada en inglés (prefiere en-US); si no hay, el navegador usa la predeterminada. */
function englishVoice() {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang === LANG) ?? voices.find((v) => v.lang?.startsWith('en')) ?? null
}

/** Lectura en voz alta en inglés (Web Speech API). */
export function useVoiceCopilot() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const msg = new SpeechSynthesisUtterance(text)
    msg.lang = LANG
    const voice = englishVoice()
    if (voice) msg.voice = voice
    msg.rate = 1.02
    msg.onend = () => setSpeaking(false)
    msg.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(msg)
  }, [])

  useEffect(() => {
    if (!supported) return undefined
    // Algunos navegadores cargan la lista de voces de forma asíncrona
    window.speechSynthesis.getVoices()
    return () => window.speechSynthesis.cancel()
  }, [])

  return { supported, speaking, speak }
}
