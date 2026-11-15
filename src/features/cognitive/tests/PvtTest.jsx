import clsx from 'clsx'
import StimulusArea from '../components/StimulusArea'
import TrialProgress from '../components/TrialProgress'
import { useKeyPress } from '../hooks/useKeyPress'
import { useTrialEngine } from '../hooks/useTrialEngine'
import { createPvtSequence, evaluatePvt, summarizePvt } from '../logic/pvt'

export default function PvtTest({ params, onComplete }) {
  const { phase, index, total, premature, respond } = useTrialEngine({
    createSequence: createPvtSequence,
    evaluate: evaluatePvt,
    params,
    onDone: (records, prem) => onComplete(summarizePvt(records, prem)),
  })

  useKeyPress((e) => {
    if (e.code !== 'Space') return false
    respond()
    return true
  })

  const lit = phase === 'stimulus'

  return (
    <div className="flex flex-col items-center gap-5">
      <TrialProgress index={index} total={total} />
      <StimulusArea onPress={() => respond()}>
        <div
          className={clsx(
            'flex h-44 w-44 items-center justify-center rounded-full border-4',
            lit ? 'border-cyan bg-cyan shadow-[0_0_40px_rgb(56_254_220/0.5)]' : 'border-line bg-panel',
          )}
        >
          {lit ? (
            <span className="text-2xl font-extrabold text-void">GO!</span>
          ) : (
            <span className="text-4xl text-slate-600">+</span>
          )}
        </div>
      </StimulusArea>
      <p className="font-mono text-xs text-slate-400">False starts: {premature}</p>
    </div>
  )
}
