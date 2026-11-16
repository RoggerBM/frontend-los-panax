import clsx from 'clsx'

const VARIANTS = {
  // Amarillo-lima: el mismo color de los botones de test del resto de la app
  primary: 'border-white/80 bg-[#E8FF5A] text-[#090D16] shadow-[0_0_28px_rgb(232_255_90/0.55)] hover:bg-[#F2FF8F]',
  ghost: 'border-slate-400/60 bg-white/5 text-slate-100 hover:border-cyan hover:text-cyan',
  danger: 'border-critical/60 bg-critical/10 text-[#FF6B6B] hover:bg-critical/20',
}

/** Botón con el estilo AEGIS usado dentro del test de fatiga. */
export default function HudButton({ variant = 'primary', icon, className, children, ...props }) {
  const Icon = icon
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-40',
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
