import { mean, median } from '../utils/stats'

export const createPvtSequence = ({ trials }) => Array.from({ length: trials }, (_, i) => ({ id: i }))

export function evaluatePvt(_stimulus, response, rt, { lapseMs }) {
  if (rt == null) return { outcome: 'timeout', rt: null }
  return { outcome: rt > lapseMs ? 'lapse' : 'hit', rt }
}

export function summarizePvt(records, premature) {
  const rts = records.filter((r) => r.rt != null).map((r) => r.rt)
  return {
    medianRt: median(rts),
    meanRt: mean(rts),
    lapses: records.filter((r) => r.outcome !== 'hit').length,
    falseStarts: premature,
  }
}
