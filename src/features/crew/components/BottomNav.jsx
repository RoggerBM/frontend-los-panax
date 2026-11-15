import clsx from 'clsx'
import { House, LayoutGrid, Plus, Undo2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Barra de navegación inferior (Livorbit) con el estilo flotante de AEGIS. */
export default function BottomNav({ onOpenScreens }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  const item = 'flex min-w-[78px] flex-col items-center justify-center gap-0.5 px-4 py-2 text-[11px] font-semibold transition sm:min-w-[92px]'

  return (
    <nav aria-label="Navigation bar" className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-stretch divide-x-[1.5px] divide-line overflow-hidden rounded-xl border-[1.5px] border-cyan/75 bg-panel/95 shadow-[0_10px_30px_rgb(0_0_0/0.75)] backdrop-blur-md">
        <button type="button" onClick={goBack} className={clsx(item, 'text-slate-200 hover:bg-cyan/15 hover:text-cyan')}>
          <Undo2 className="h-5 w-5" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-current={pathname === '/' ? 'page' : undefined}
          className={clsx(
            item,
            pathname === '/' ? 'bg-cyan/15 text-cyan' : 'text-slate-200 hover:bg-cyan/15 hover:text-cyan',
          )}
        >
          <House className="h-5 w-5" aria-hidden />
          Home
        </button>
        <button type="button" onClick={onOpenScreens} className={clsx(item, 'text-slate-200 hover:bg-cyan/15 hover:text-cyan')}>
          <LayoutGrid className="h-5 w-5" aria-hidden />
          Screens
        </button>
        <button
          type="button"
          onClick={() => navigate('/emergencia')}
          className={clsx(item, 'bg-critical font-bold text-white hover:brightness-110')}
        >
          <Plus className="h-5 w-5" strokeWidth={3} aria-hidden />
          Emergency
        </button>
      </div>
    </nav>
  )
}
