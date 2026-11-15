import { ArrowRight } from 'lucide-react'
import Button from '@/shared/components/Button'
import { useKeyPress } from '../hooks/useKeyPress'

export default function BlockIntro({ test, hint, number, total, onContinue }) {
  const Icon = test.icon

  useKeyPress((e) => {
    if (e.code !== 'Space' && e.code !== 'Enter') return false
    onContinue()
    return true
  })

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 py-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-paper/50">
        Bloque {number} de {total}
      </p>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/15">
        <Icon className="h-7 w-7 text-brand" aria-hidden />
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand">{test.tag}</p>
        <h2 className="text-xl text-paper">{test.name}</h2>
      </div>
      <p className="max-w-sm text-sm text-paper/80">{hint}</p>
      <Button icon={ArrowRight} onClick={onContinue}>
        Continuar
      </Button>
      <p className="text-[10px] uppercase tracking-wider text-paper/40">o pulsa espacio</p>
    </div>
  )
}
