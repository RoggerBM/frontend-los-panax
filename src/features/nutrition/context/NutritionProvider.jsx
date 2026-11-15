import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getUsers } from '@/features/auth'
import { LINKS, analyze, answer, applyLog, generateDays, nutritionProfile } from '../lib/nutritionModel'
import { NutritionContext } from './nutritionContext'

const EARTH_REPLY = 'Earth nutritionist: agree with the AI plan. Follow it for 72 h and repeat the analysis.'

/**
 * Estado de la nutrición con IA a bordo: registros de 30 días por tripulante, enlace con Tierra,
 * cola de mensajes (se envían solos al volver la señal), recomendaciones hechas y chat.
 */
export default function NutritionProvider({ children }) {
  const users = getUsers()
  const profiles = useMemo(() => users.map((u, i) => nutritionProfile(u, i)), [users])

  const [days, setDays] = useState(() => Object.fromEntries(profiles.map((p) => [p.id, generateDays(p)])))
  const [link, setLink] = useState('slow')
  const [queue, setQueue] = useState([])
  const [done, setDone] = useState(() => new Set())
  const [chats, setChats] = useState({})
  const [now, setNow] = useState(() => Date.now())
  const seq = useRef(0)

  const analyses = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, analyze(p, days[p.id])])),
    [profiles, days],
  )

  const enqueue = useCallback((crewId, txt) => {
    seq.current += 1
    const id = seq.current
    setQueue((q) => [{ id, crewId, txt, t: Date.now(), sent: null, reply: null }, ...q])
  }, [])

  // Alerta automática: si un tripulante entra en alerta y no tiene mensaje pendiente, se avisa a Tierra
  useEffect(() => {
    for (const p of profiles) {
      const R = analyses[p.id]
      if (R.st === 2 && !queue.some((q) => q.crewId === p.id)) {
        enqueue(p.id, `Automatic nutrition alert · risk ${R.risk}/100 · energy ${Math.round(R.e7 * 100)}%`)
      }
    }
  }, [analyses, profiles, queue, enqueue])

  // Bomba de mensajes: con señal se envían; tras el retraso de demo llega la respuesta
  const pending = queue.some((q) => !q.reply)
  useEffect(() => {
    if (!pending) return undefined
    const tick = () => {
      const t = Date.now()
      const L = LINKS[link]
      setNow(t)
      setQueue((q) => {
        let changed = false
        const next = q.map((m) => {
          let item = m
          if (L.delayMs != null && !item.sent) item = { ...item, sent: t }
          if (item.sent && !item.reply && L.delayMs != null && t - item.sent > L.delayMs) item = { ...item, reply: EARTH_REPLY }
          if (item !== m) changed = true
          return item
        })
        return changed ? next : q
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [pending, link])

  const logEntry = useCallback((crewId, kind) => {
    setDays((d) => ({ ...d, [crewId]: applyLog(d[crewId], kind) }))
  }, [])

  const markDone = useCallback((crewId, recId) => {
    setDone((s) => new Set(s).add(`${crewId}:${recId}`))
  }, [])

  const ask = useCallback(
    (crewId, question) => {
      const reply = answer(question, analyses[crewId], link, done)
      setChats((c) => ({ ...c, [crewId]: [...(c[crewId] ?? []), ['u', question], ['a', reply]] }))
    },
    [analyses, link, done],
  )

  const value = useMemo(
    () => ({ profiles, analyses, link, setLink, queue, now, done, chats, logEntry, markDone, enqueue, ask }),
    [profiles, analyses, link, queue, now, done, chats, logEntry, markDone, enqueue, ask],
  )

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>
}
