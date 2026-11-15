import { useCallback, useEffect, useRef, useState } from 'react'
import { randomBetween } from '../utils/stats'

/**
 * Motor genérico de ensayos usado por las tres pruebas.
 *
 * Ciclo por ensayo:  isi (espera aleatoria) -> stimulus (hasta respuesta o timeout)
 * Al terminar la secuencia llama a onDone(records, premature).
 *
 * - createSequence(params): genera los estímulos.
 * - evaluate(stimulus, response, rtMs | null, params): clasifica la respuesta.
 * - Pulsar durante el isi cuenta como respuesta anticipada (premature).
 */
export function useTrialEngine({ createSequence, evaluate, params, onDone }) {
  const { isiMin, isiMax, timeoutMs } = params

  const [phase, setPhase] = useState('ready') // ready | isi | stimulus | done
  const [index, setIndex] = useState(0)
  const [sequence, setSequence] = useState([])
  const [premature, setPremature] = useState(0)
  const [lastRecord, setLastRecord] = useState(null)

  const phaseRef = useRef('ready')
  const indexRef = useRef(0)
  const sequenceRef = useRef([])
  const recordsRef = useRef([])
  const prematureRef = useRef(0)
  const shownAtRef = useRef(0)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const goTo = useCallback((next) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const start = useCallback(() => {
    const seq = createSequence(params)
    sequenceRef.current = seq
    indexRef.current = 0
    recordsRef.current = []
    prematureRef.current = 0
    setSequence(seq)
    setIndex(0)
    setPremature(0)
    setLastRecord(null)
    goTo('isi')
  }, [createSequence, params, goTo])

  const finishTrial = useCallback(
    (response) => {
      if (phaseRef.current !== 'stimulus') return
      const rt = response == null ? null : performance.now() - shownAtRef.current
      const stimulus = sequenceRef.current[indexRef.current]
      const record = { ...evaluate(stimulus, response, rt, params), stimulus }

      recordsRef.current = [...recordsRef.current, record]
      setLastRecord(record)

      const next = indexRef.current + 1
      if (next >= sequenceRef.current.length) {
        goTo('done')
        onDoneRef.current?.(recordsRef.current, prematureRef.current)
      } else {
        indexRef.current = next
        setIndex(next)
        goTo('isi')
      }
    },
    [evaluate, params, goTo],
  )

  const respond = useCallback(
    (response = true) => {
      if (phaseRef.current === 'isi') {
        prematureRef.current += 1
        setPremature(prematureRef.current)
      } else if (phaseRef.current === 'stimulus') {
        finishTrial(response)
      }
    },
    [finishTrial],
  )

  // Arranca al montar
  useEffect(() => {
    start()
  }, [start])

  // Espera aleatoria antes de cada estímulo
  useEffect(() => {
    if (phase !== 'isi') return undefined
    const id = setTimeout(() => goTo('stimulus'), randomBetween(isiMin, isiMax))
    return () => clearTimeout(id)
  }, [phase, index, isiMin, isiMax, goTo])

  // Estímulo visible: marca el tiempo y aplica el límite de respuesta
  useEffect(() => {
    if (phase !== 'stimulus') return undefined
    shownAtRef.current = performance.now()
    const id = setTimeout(() => finishTrial(null), timeoutMs)
    return () => clearTimeout(id)
  }, [phase, index, timeoutMs, finishTrial])

  return {
    phase,
    index,
    total: sequence.length,
    current: sequence[index] ?? null,
    premature,
    lastRecord,
    respond,
  }
}
