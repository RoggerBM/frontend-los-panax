import clsx from 'clsx'
import { ArrowRight, LogOut, RotateCcw } from 'lucide-react'
import Button from '@/shared/components/Button'
import { BLOCK_ON_FAIL } from '../config/validation'
import ReactionTimes from './ReactionTimes'
import VerdictBadge from './VerdictBadge'
import { LEVEL_STYLES } from '../config/levelStyles'

export default function ValidationResult({ evaluation, isBaseline, onContinue, onRetry, onLogout }) {
  const blocked = BLOCK_ON_FAIL && evaluation.verdict === 'fail'

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <VerdictBadge verdict={evaluation.verdict} />

      <section>
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand">
          Estimación de tiempos
        </h3>
        <ReactionTimes times={evaluation.times} />
      </section>

      <section>
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand">Indicadores</h3>
        <ul className="flex flex-col">
          {evaluation.checks.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between border-b border-paper/10 py-2 text-xs last:border-0"
            >
              <span className="flex items-center gap-2 text-paper/70">
                <span className={clsx('h-2 w-2 rounded-full', LEVEL_STYLES[c.level].dot)} />
                {c.label}
              </span>
              <span className={clsx('tabular-nums', LEVEL_STYLES[c.level].text)}>{c.value}</span>
            </li>
          ))}
        </ul>
        {isBaseline && (
          <p className="mt-2 text-xs text-paper/50">
            Primera validación: se guardó como tu línea base para las próximas.
          </p>
        )}
      </section>

      {blocked ? (
        <div className="flex gap-2">
          <Button variant="danger" icon={LogOut} className="flex-1" onClick={onLogout}>
            Salir
          </Button>
          <Button icon={RotateCcw} className="flex-1" onClick={onRetry}>
            Repetir
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="ghost" icon={RotateCcw} onClick={onRetry} aria-label="Repetir" />
          <Button icon={ArrowRight} className="flex-1" onClick={onContinue}>
            Continuar al panel
          </Button>
        </div>
      )}
    </div>
  )
}
