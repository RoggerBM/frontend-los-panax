import { Play, ShieldCheck, Timer } from 'lucide-react'
import Button from '@/shared/components/Button'
import { TESTS } from '../config/tests'
import { VALIDATION_BLOCKS, VALIDATION_DURATION } from '../config/validation'

export default function ValidationIntro({ user, onStart }) {
  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/15">
          <ShieldCheck className="h-6 w-6 text-brand" aria-hidden />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand">Validación de operador</p>
          <h2 className="text-lg text-paper">Hola, {user.name}</h2>
        </div>
      </div>

      <p className="text-sm text-paper/70">
        Antes de entrar al panel, completa una prueba corta de alerta. Son 3 bloques seguidos:
      </p>

      <ol className="flex flex-col gap-2">
        {VALIDATION_BLOCKS.map((block, i) => {
          const test = TESTS[block.id]
          const Icon = test.icon
          return (
            <li
              key={block.id}
              className="flex items-center gap-3 rounded-lg border border-paper/10 bg-black/15 px-3 py-2.5"
            >
              <span className="text-xs tabular-nums text-paper/40">{i + 1}</span>
              <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              <div className="text-sm">
                <p className="text-paper">{test.name}</p>
                <p className="text-xs text-paper/50">{block.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="flex items-center gap-1.5 text-xs text-paper/50">
        <Timer className="h-4 w-4" aria-hidden /> Duración total {VALIDATION_DURATION}
      </p>

      <Button icon={Play} onClick={onStart}>
        Comenzar validación
      </Button>
    </div>
  )
}
