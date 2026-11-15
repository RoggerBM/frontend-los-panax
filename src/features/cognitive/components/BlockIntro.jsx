import { ArrowRight } from 'lucide-react'
import { useKeyPress } from '../hooks/useKeyPress'
import HudButton from './HudButton'

export default function BlockIntro({ test, hint, number, total, onContinue }) {
  const Icon = test.icon

  useKeyPress((e) => {
    if (e.code !== 'Space' && e.code !== 'Enter') return false
    onContinue()
    return true
  })

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 py-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
        Block {number} of {total}
      </p>
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-cyan/60 bg-cyan/10">
        <Icon className="h-7 w-7 text-cyan" aria-hidden />
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">{test.tag}</p>
        <h2 className="text-xl font-extrabold text-white">{test.name}</h2>
      </div>
      <p className="max-w-sm text-sm text-slate-300">{hint}</p>
      <HudButton icon={ArrowRight} onClick={onContinue}>
        Continue
      </HudButton>
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">or press space</p>
    </div>
  )
}
