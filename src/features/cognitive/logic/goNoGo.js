import { mean, shuffle } from '../utils/stats'

export function createGoNoGoSequence({ trials, goRatio }) {
  const goCount = Math.round(trials * goRatio)
  return shuffle(
    Array.from({ length: trials }, (_, i) => ({ id: i, kind: i < goCount ? 'go' : 'nogo' })),
  )
}

export function evaluateGoNoGo(stimulus, response, rt) {
  const pressed = response != null
  if (stimulus.kind === 'go') return pressed ? { outcome: 'hit', rt } : { outcome: 'omission', rt: null }
  return pressed ? { outcome: 'commission', rt } : { outcome: 'correct-rejection', rt: null }
}

export function summarizeGoNoGo(records) {
  const count = (o) => records.filter((r) => r.outcome === o).length
  const hits = records.filter((r) => r.outcome === 'hit')
  const correct = hits.length + count('correct-rejection')
  return {
    accuracy: records.length ? (correct / records.length) * 100 : null,
    meanRt: mean(hits.map((r) => r.rt)),
    commissions: count('commission'),
    omissions: count('omission'),
  }
}
