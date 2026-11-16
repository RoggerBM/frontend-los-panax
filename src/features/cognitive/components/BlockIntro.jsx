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
    <div className="animate-fade-in flex flex-col items-center gap-6 py-10 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-slate-200">
        Block {number} of {total}
      </p>
      <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan bg-cyan/20 shadow-[0_0_30px_rgb(56_254_220/0.35)]">
        <Icon className="h-12 w-12 text-cyan" aria-hidden />
      </span>
      <div>
        <p className="font-mono text-sm uppercase tracking-widest text-cyan">{test.tag}</p>
        <h2 className="text-4xl font-extrabold text-white">{test.name}</h2>
      </div>
      <p className="max-w-xl text-xl text-slate-100">{hint}</p>
      <HudButton icon={ArrowRight} onClick={onContinue}>
        Continue
      </HudButton>
      <p className="font-mono text-sm uppercase tracking-wider text-slate-300">or press space</p>
    </div>
  )
}
