import clsx from 'clsx'
import { Timer } from 'lucide-react'

const SIZES = {
  sm: 'gap-1.5 rounded-lg px-3 py-1.5 text-xs',
  md: 'gap-2 rounded-xl px-5 py-3 text-sm',
  lg: 'gap-2.5 rounded-2xl px-5 py-4 text-base',
}

/**
 * Botón para lanzar un test. Amarillo-lima brillante con resplandor y un halo que late,
 * para que no se pierda con el fondo oscuro ni con los botones cian del resto de la app.
 */
export default function TestButton({ size = 'md', icon = Timer, className, children, ...props }) {
  const Icon = icon
  return (
    <button
      type="button"
      className={clsx(
        'group relative inline-flex items-center justify-center border-2 border-white/80 bg-[#E8FF5A] font-extrabold uppercase tracking-wider text-[#090D16]',
        'shadow-[0_0_28px_rgb(232_255_90/0.55)] transition hover:scale-[1.02] hover:bg-[#F2FF8F] hover:shadow-[0_0_40px_rgb(232_255_90/0.8)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        SIZES[size],
        className,
      )}
      {...props}
    >
      {/* Halo que late alrededor del botón */}
      <span className="pointer-events-none absolute -inset-1 animate-pulse rounded-[inherit] border-2 border-[#E8FF5A]/60" aria-hidden />
      <Icon className={clsx('shrink-0', size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} strokeWidth={2.6} aria-hidden />
      <span>{children}</span>
    </button>
  )
}
