import clsx from 'clsx'
import { LEVEL_STYLES } from '../config/levelStyles'
import { VERDICTS } from '../logic/verdict'

export default function VerdictBadge({ verdict, compact = false }) {
  const style = LEVEL_STYLES[verdict]
  const Icon = style.icon
  return (
    <div className={clsx('flex items-center gap-3 rounded-lg border-[1.5px]', style.border, style.bg, compact ? 'p-2.5' : 'p-4')}>
      <Icon className={clsx('shrink-0', style.text, compact ? 'h-5 w-5' : 'h-8 w-8')} aria-hidden />
      <div>
        <p className={clsx('font-bold uppercase tracking-wider', style.text, compact ? 'text-xs' : 'text-base')}>
          {VERDICTS[verdict].label}
        </p>
        {!compact && <p className="text-xs text-slate-300">{VERDICTS[verdict].description}</p>}
      </div>
    </div>
  )
}
