import clsx from 'clsx'
import StimulusArea from '../components/StimulusArea'
import TrialProgress from '../components/TrialProgress'
import { useKeyPress } from '../hooks/useKeyPress'
import { useTrialEngine } from '../hooks/useTrialEngine'
import { createGoNoGoSequence, evaluateGoNoGo, summarizeGoNoGo } from '../logic/goNoGo'

const FEEDBACK = {
  commission: { text: 'It was red: you should not have pressed', className: 'text-caution' },
  omission: { text: 'Too slow', className: 'text-caution' },
}

export default function GoNoGoTest({ params, onComplete }) {
  const { phase, index, total, current, lastRecord, respond } = useTrialEngine({
    createSequence: createGoNoGoSequence,
    evaluate: evaluateGoNoGo,
    params,
    onDone: (records) => onComplete(summarizeGoNoGo(records)),
  })

  useKeyPress((e) => {
    if (e.code !== 'Space') return false
    respond()
    return true
  })

  const visible = phase === 'stimulus' && current
  const feedback = phase === 'isi' && lastRecord ? FEEDBACK[lastRecord.outcome] : null

  return (
    <div className="flex flex-col items-center gap-5">
      <TrialProgress index={index} total={total} />
      <StimulusArea onPress={() => respond()}>
        {visible ? (
          <div
            className={clsx(
              'h-64 w-64 rounded-full',
              current.kind === 'go'
                ? 'bg-green-500 shadow-[0_0_40px_rgb(34_197_94/0.5)]' // verde fijo: es el estímulo "pulsa"
                : 'bg-rose-500 shadow-[0_0_40px_rgb(244_63_94/0.5)]',
            )}
          />
        ) : (
          <span className="text-6xl text-slate-300">+</span>
        )}
      </StimulusArea>
      <p className={clsx('h-6 text-base font-semibold', feedback?.className)}>{feedback?.text}</p>
    </div>
  )
}
