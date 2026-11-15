import clsx from 'clsx'
import StimulusArea from '../components/StimulusArea'
import TrialProgress from '../components/TrialProgress'
import { useKeyPress } from '../hooks/useKeyPress'
import { useTrialEngine } from '../hooks/useTrialEngine'
import { createGoNoGoSequence, evaluateGoNoGo, summarizeGoNoGo } from '../logic/goNoGo'

const FEEDBACK = {
  commission: { text: 'Era rojo: no debías pulsar', className: 'text-amber-300' },
  omission: { text: 'Demasiado lento', className: 'text-amber-300' },
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
              'h-44 w-44 rounded-full',
              current.kind === 'go'
                ? 'bg-green-500 shadow-[0_0_40px_rgb(34_197_94/0.5)]' // verde fijo: es el estímulo "pulsa"
                : 'bg-rose-500 shadow-[0_0_40px_rgb(244_63_94/0.5)]',
            )}
          />
        ) : (
          <span className="text-4xl text-paper/30">+</span>
        )}
      </StimulusArea>
      <p className={clsx('h-4 text-xs', feedback?.className)}>{feedback?.text}</p>
    </div>
  )
}
