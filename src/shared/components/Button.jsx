import clsx from 'clsx'

const VARIANTS = {
  primary:
    'bg-brand text-ink hover:bg-brand-soft disabled:bg-paper/10 disabled:text-paper/40',
  ghost:
    'border border-brand/30 text-brand-soft hover:bg-brand/10 disabled:text-paper/40',
  danger:
    'border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:text-paper/40',
}

export default function Button({ variant = 'primary', icon: Icon, className, children, ...props }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft disabled:cursor-not-allowed',
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
