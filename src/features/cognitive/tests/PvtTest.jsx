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
            'flex h-64 w-64 items-center justify-center rounded-full border-[6px]',
            lit ? 'border-white bg-[#E8FF5A] shadow-[0_0_70px_rgb(232_255_90/0.75)]' : 'border-slate-400/50 bg-[#2E4064]',
          )}
        >
          {lit ? (
            <span className="text-5xl font-extrabold text-void">GO!</span>
          ) : (
            <span className="text-6xl text-slate-300">+</span>
          )}
        </div>
      </StimulusArea>
      <p className="font-mono text-base text-slate-200">False starts: {premature}</p>
    </div>
  )
}
