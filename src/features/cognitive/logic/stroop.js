import { STROOP_COLORS } from '../config/tests'
import { mean, pick, shuffle } from '../utils/stats'

export function createStroopSequence({ trials, congruentRatio }) {
  const congruentCount = Math.round(trials * congruentRatio)
  return shuffle(
    Array.from({ length: trials }, (_, i) => {
      const ink = pick(STROOP_COLORS)
      const congruent = i < congruentCount
      const word = congruent ? ink : pick(STROOP_COLORS.filter((c) => c.id !== ink.id))
      return { id: i, ink: ink.id, inkHex: ink.hex, word: word.label.toUpperCase(), congruent }
    }),
  )
}

export function evaluateStroop(stimulus, response, rt) {
  if (response == null) return { outcome: 'omission', correct: false, rt: null }
  const correct = response === stimulus.ink
  return { outcome: correct ? 'correct' : 'error', correct, rt }
}

export function summarizeStroop(records) {
  const rtsOf = (congruent) =>
    records.filter((r) => r.correct && r.stimulus.congruent === congruent).map((r) => r.rt)
  const meanCongruent = mean(rtsOf(true))
  const meanIncongruent = mean(rtsOf(false))
  return {
    accuracy: records.length ? (records.filter((r) => r.correct).length / records.length) * 100 : null,
    meanCongruent,
    meanIncongruent,
    interference:
      meanCongruent != null && meanIncongruent != null ? meanIncongruent - meanCongruent : null,
  }
}
