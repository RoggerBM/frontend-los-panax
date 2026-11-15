import clsx from 'clsx'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { MODULES } from '../config/modules'
import { STATUS } from '../config/status'
import { countFlagged, worstModuleLevel } from '../lib/crewModel'
import { StatusDot } from './ui'

/** Lista de módulos. compact = solo iconos con su estado (barra plegada). */
function ModuleLinks({ crew, compact, onNavigate }) {
  return (
    <nav className="flex flex-col gap-2" aria-label="Biomedical modules">
      {MODULES.map((m) => {
        const Icon = m.icon
        const n = countFlagged(crew, m.key)
        const level = worstModuleLevel(crew, m.key)
        return (
          <NavLink
            key={m.key}
            to={`/mod/${m.key}`}
            onClick={onNavigate}
            title={compact ? `${m.name} · ${n ? `${n} to review` : 'OK'}` : undefined}
            aria-label={compact ? m.name : undefined}
            className={({ isActive }) =>
              clsx(
                'relative flex min-w-0 items-center rounded-lg border-[1.5px] transition-all',
                compact ? 'h-10 w-10 justify-center' : 'gap-2 px-3 py-2.5',
                isActive
                  ? 'border-cyan bg-[linear-gradient(90deg,rgb(56_254_220/0.14)_0%,rgb(17_23_38/0.95)_100%)] shadow-[0_0_14px_rgb(56_254_220/0.16)]'
                  : 'border-line bg-panel hover:border-cyan/55 hover:bg-elevated',
                !compact && !isActive && 'hover:translate-x-0.5',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            {compact ? (
              <StatusDot level={level} className="absolute -right-0.5 -top-0.5 ring-2 ring-void" />
            ) : (
              <>
                <span className="min-w-0 truncate text-[13px] font-semibold text-slate-100" title={m.name}>
                  {m.name}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-1">
                  <span className="whitespace-nowrap font-mono text-[10px] text-slate-400">{n ? `${n} rev.` : 'OK'}</span>
                  <StatusDot level={level} />
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

function Legend() {
  return (
    <div className="space-y-2 rounded-lg border-[1.5px] border-line bg-panel/80 p-3">
      <div className="font-mono text-[10px] font-bold uppercase text-slate-400">Status code</div>
      {[0, 1, 2, -1].map((lvl) => {
        const s = STATUS[lvl]
        const Icon = s.icon
        return (
          <div key={lvl} className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="flex h-4 w-4 items-center justify-center rounded-sm" style={{ backgroundColor: s.hex }}>
              <Icon className="h-3 w-3 text-void" strokeWidth={3} aria-hidden />
            </span>
            {s.label}
          </div>
        )
      })}
      <p className="border-t border-line pt-2 text-[10.5px] leading-snug text-slate-500">
        The heart on each card beats at the real pulse rate.
      </p>
    </div>
  )
}

/**
 * Navbar vertical de módulos.
 * - Escritorio: se pliega a una barra de iconos con el botón o al elegir un módulo.
 * - Móvil: cajón lateral (mobileOpen) que se cierra al elegir.
 */
export default function ModuleSidebar({ crew, open, onToggle, onSelect, mobileOpen, onMobileClose }) {
  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && onMobileClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  return (
    <>
      {/* Escritorio */}
      <aside
        className={clsx(
          'hidden shrink-0 flex-col gap-3 transition-[width] duration-300 lg:flex',
          open ? 'w-[232px]' : 'w-10',
        )}
        aria-label="Modules navigation"
      >
        <div className={clsx('flex items-center', open ? 'justify-between px-1' : 'justify-center')}>
          {open && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Modules <span className="text-cyan">· {MODULES.length}</span>
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? 'Collapse modules' : 'Expand modules'}
            title={open ? 'Collapse modules' : 'Expand modules'}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-slate-300 transition hover:border-cyan hover:text-cyan"
          >
            {open ? <PanelLeftClose className="h-4 w-4" aria-hidden /> : <PanelLeftOpen className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        <ModuleLinks crew={crew} compact={!open} onNavigate={onSelect} />
        {open && <Legend />}
      </aside>

      {/* Móvil: cajón lateral */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={(e) => e.target === e.currentTarget && onMobileClose()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Modules"
            className="flex h-full w-[260px] animate-fade-in flex-col gap-3 overflow-y-auto border-r-[1.5px] border-cyan/60 bg-inset p-3"
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Modules <span className="text-cyan">· {MODULES.length}</span>
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close modules"
                className="rounded-md p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ModuleLinks crew={crew} compact={false} onNavigate={onMobileClose} />
            <Legend />
          </div>
        </div>
      )}
    </>
  )
}
