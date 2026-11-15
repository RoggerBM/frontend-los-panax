import clsx from 'clsx'
import { statusOf, tint } from '../config/status'

/** Panel base AEGIS. */
export function Panel({ className, children, ...rest }) {
  return (
    <section className={clsx('rounded-xl border-[1.5px] border-line bg-panel p-4', className)} {...rest}>
      {children}
    </section>
  )
}

export function SectionLabel({ children, right, className }) {
  return (
    <div className={clsx('mb-2 flex items-center justify-between gap-2', className)}>
      <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">{children}</span>
      {right}
    </div>
  )
}

/** Etiqueta de estado con icono SVG + texto (nunca solo color). */
export function StatusTag({ level, short = false, className }) {
  const s = statusOf(level)
  const Icon = s.icon
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase',
        className,
      )}
      style={tint(s)}
    >
      <Icon className="h-3 w-3" strokeWidth={2.6} aria-hidden />
      {short ? s.short : s.label}
    </span>
  )
}

export function StatusDot({ level, className }) {
  const s = statusOf(level)
  return (
    <span
      className={clsx('h-2 w-2 shrink-0 rounded-full', level === 2 && 'animate-critical', className)}
      style={{ backgroundColor: s.hex, boxShadow: `0 0 6px ${s.hex}` }}
      aria-hidden
    />
  )
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

/** Corazón que late al ritmo real del pulso. */
export function Heart({ bpm, color = '#C51111', className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('shrink-0', bpm ? 'animate-heartbeat' : 'opacity-40', className)}
      style={{ color, animationDuration: bpm ? `${(60 / bpm).toFixed(3)}s` : undefined }}
      aria-hidden
    >
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  )
}
