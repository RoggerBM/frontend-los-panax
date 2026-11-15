import TrialProgress from '../components/TrialProgress'
import { STROOP_COLORS } from '../config/tests'
import { useKeyPress } from '../hooks/useKeyPress'
import { useTrialEngine } from '../hooks/useTrialEngine'
import { createStroopSequence, evaluateStroop, summarizeStroop } from '../logic/stroop'

export default function StroopTest({ params, onComplete }) {
  const { phase, index, total, current, respond } = useTrialEngine({
    createSequence: createStroopSequence,
    evaluate: evaluateStroop,
    params,
    onDone: (records) => onComplete(summarizeStroop(records)),
  })

  useKeyPress((e) => {
    const color = STROOP_COLORS.find((c) => c.key === e.key)
    if (!color) return false
    respond(color.id)
    return true
  })

  const visible = phase === 'stimulus' && current

  return (
    <div className="flex flex-col items-center gap-5">
      <TrialProgress index={index} total={total} />

      <div className="flex h-56 w-full select-none items-center justify-center rounded-xl border border-brand/20 bg-black/20">
        {visible ? (
          <span className="text-5xl font-bold tracking-wider sm:text-6xl" style={{ color: current.inkHex }}>
            {current.word}
          </span>
        ) : (
          <span className="text-4xl text-paper/30">+</span>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {STROOP_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              respond(c.id)
            }}
            className="touch-manipulation rounded-lg border border-paper/15 bg-paper/5 px-3 py-3 text-sm uppercase tracking-wider text-paper hover:border-brand/50"
          >
            <span className="mr-2 text-paper/40">{c.key}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
