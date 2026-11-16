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

      <div className="flex h-80 w-full select-none items-center justify-center rounded-2xl border-2 border-cyan/50 bg-[#22324F]">
        {visible ? (
          <span className="text-6xl font-extrabold tracking-wider sm:text-8xl" style={{ color: current.inkHex }}>
            {current.word}
          </span>
        ) : (
          <span className="text-6xl text-slate-300">+</span>
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
            className="touch-manipulation rounded-xl border-2 border-slate-400/50 bg-[#2E4064] px-4 py-5 text-lg font-bold uppercase tracking-wider text-white hover:border-cyan"
          >
            <span className="mr-2 font-mono text-slate-500">{c.key}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
