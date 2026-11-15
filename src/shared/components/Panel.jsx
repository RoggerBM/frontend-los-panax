import clsx from 'clsx'

export default function Panel({ title, icon: Icon, actions, className, children }) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-brand/20 bg-paper/5 p-4 shadow-lg shadow-black/20 backdrop-blur',
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand">
            {Icon && <Icon className="h-4 w-4" aria-hidden />}
            {title}
          </h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
