import clsx from 'clsx'
import { TONE_CLASSES, TONE_HEX } from '../config/colors'

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'flex flex-col justify-between rounded-xl border border-brand/20 bg-black/20 px-3.5 py-3 transition-colors hover:border-brand/35',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, children }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-1.5">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-paper/60">{title}</span>
      {children}
    </div>
  )
}

export function Badge({ tone = 'info', children }) {
  return (
    <span
      className={clsx(
        'whitespace-nowrap rounded border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide',
        TONE_CLASSES[tone].badge,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ tone }) {
  return (
    <span
      className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', TONE_CLASSES[tone].bg)}
      style={{ boxShadow: `0 0 6px ${TONE_HEX[tone]}` }}
    />
  )
}

/** Anillo de progreso circular. */
export function Donut({ pct, tone }) {
  return (
    <div className="relative h-[52px] w-[52px] shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(224 231 255 / 0.08)" strokeWidth="3.2" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={TONE_HEX[tone]}
          strokeWidth="3.2"
          strokeDasharray={`${pct * 0.942} 100`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-paper">
        {pct}%
      </span>
    </div>
  )
}
