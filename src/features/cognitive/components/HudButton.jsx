import clsx from 'clsx'

const VARIANTS = {
  primary: 'border-cyan bg-cobalt/40 text-white hover:bg-cobalt/60',
  ghost: 'border-line bg-void text-slate-200 hover:border-cyan hover:text-cyan',
  danger: 'border-critical/60 bg-critical/10 text-[#FF6B6B] hover:bg-critical/20',
}

/** Botón con el estilo AEGIS usado dentro del test de fatiga. */
export default function HudButton({ variant = 'primary', icon, className, children, ...props }) {
  const Icon = icon
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  )
}
