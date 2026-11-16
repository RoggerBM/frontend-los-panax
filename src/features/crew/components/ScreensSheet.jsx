import clsx from 'clsx'
import { Database, House, Plus, Timer, X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODULES } from '../config/modules'
import { DEMO_MODES } from '../config/scenarios'
import { StatusDot } from './ui'

function Group({ title, children }) {
  return (
    <div>
      <div className="mb-1.5 mt-3 font-mono text-[10.5px] font-bold uppercase tracking-widest text-slate-400">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

const linkCls =
  'inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan'

/** Panel inferior "Pantallas": accesos directos y escenarios de demo. */
export default function ScreensSheet({ open, onClose, crew, demoMode, onDemoModeChange }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const go = (to) => {
    onClose()
    navigate(to)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Screens"
        className="max-h-[80vh] w-full max-w-3xl animate-fade-in overflow-auto rounded-2xl border-[1.5px] border-cyan/60 bg-panel p-4 shadow-[0_-10px_40px_rgb(0_0_0/0.6)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan">Screens</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <Group title="Main">
          <button type="button" className={linkCls} onClick={() => go('/')}>
            <House className="h-4 w-4" aria-hidden /> Home
          </button>
          <button type="button" className={clsx(linkCls, 'hover:border-critical hover:text-red-300')} onClick={() => go('/emergencia')}>
            <Plus className="h-4 w-4" strokeWidth={3} aria-hidden /> Emergency
          </button>
          <button type="button" className={linkCls} onClick={() => go('/nasa-data')}>
            <Database className="h-4 w-4 text-cyan" aria-hidden /> NASA Data
          </button>
        </Group>

        <Group title="Modules">
          {MODULES.map((m) => {
            const Icon = m.icon
            return (
              <button key={m.key} type="button" className={linkCls} onClick={() => go(`/mod/${m.key}`)}>
                <Icon className="h-4 w-4 text-cyan" aria-hidden /> {m.name}
              </button>
            )
          })}
        </Group>

        <Group title="Astronauts">
          {crew.map((c) => (
            <button key={c.id} type="button" className={linkCls} onClick={() => go(`/ast/${c.id}`)}>
              <StatusDot level={c.level} /> {c.name}
            </button>
          ))}
        </Group>

        <Group title="Demo scenario">
          <div className="grid w-full gap-1.5 sm:grid-cols-2">
            {DEMO_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onDemoModeChange(m.id)}
                className={clsx(
                  'rounded-lg border-[1.5px] px-3 py-2 text-left transition',
                  demoMode === m.id ? 'border-cyan bg-cyan/10' : 'border-line bg-void hover:border-cyan/60',
                )}
              >
                <b className={clsx('block text-xs', demoMode === m.id ? 'text-cyan' : 'text-slate-100')}>{m.label}</b>
                <span className="text-[11px] text-slate-400">{m.desc}</span>
              </button>
            ))}
          </div>
        </Group>

        <Group title="Fatigue test">
          <button type="button" className={linkCls} onClick={() => go('/mod/fat/test')}>
            <Timer className="h-4 w-4 text-cyan" aria-hidden /> PVT + Go/No-Go + Stroop
          </button>
        </Group>
      </div>
    </div>
  )
}
