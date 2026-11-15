import clsx from 'clsx'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { LEVEL_STYLES } from '../config/levelStyles'
import HudButton from './HudButton'
import ReactionTimes from './ReactionTimes'
import VerdictBadge from './VerdictBadge'

export default function ValidationResult({ evaluation, isBaseline, onDone, onRetry }) {
  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <VerdictBadge verdict={evaluation.verdict} />

      <section>
        <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Estimated times</h3>
        <ReactionTimes times={evaluation.times} />
      </section>

      <section>
        <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Indicators</h3>
        <ul className="flex flex-col">
          {evaluation.checks.map((c) => (
            <li key={c.label} className="flex items-center justify-between border-b border-line py-2 text-xs last:border-0">
              <span className="flex items-center gap-2 text-slate-300">
                <span className={clsx('h-2 w-2 rounded-full', LEVEL_STYLES[c.level].dot)} />
                {c.label}
              </span>
              <span className={clsx('font-mono', LEVEL_STYLES[c.level].text)}>{c.value}</span>
            </li>
          ))}
        </ul>
        {isBaseline && (
          <p className="mt-2 text-xs text-slate-400">First test: saved as your baseline for future comparisons.</p>
        )}
      </section>

      <div className="flex gap-2">
        <HudButton variant="ghost" icon={RotateCcw} onClick={onRetry}>
          Retake
        </HudButton>
        <HudButton icon={ArrowLeft} className="flex-1" onClick={onDone}>
          Back to Fatigue &amp; Sleep
        </HudButton>
      </div>
    </div>
  )
}
