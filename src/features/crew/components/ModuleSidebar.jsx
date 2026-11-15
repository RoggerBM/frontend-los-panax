import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { MODULES } from '../config/modules'
import { STATUS } from '../config/status'
import { countFlagged, worstModuleLevel } from '../lib/crewModel'
import { StatusDot } from './ui'

/** Barra lateral con los 7 módulos biomédicos (Livorbit) en estilo AEGIS. */
export default function ModuleSidebar({ crew }) {
  return (
    <aside
      className="flex gap-2 overflow-x-auto pb-1 lg:col-span-3 lg:flex-col lg:overflow-visible lg:pb-0 xl:col-span-2"
      aria-label="Biomedical modules"
    >
      <div className="mb-1 hidden items-center justify-between px-1 lg:flex">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Modules</span>
        <span className="font-mono text-[10px] text-cyan">{MODULES.length} AREAS</span>
      </div>

      {MODULES.map((m) => {
        const Icon = m.icon
        const n = countFlagged(crew, m.key)
        return (
          <NavLink
            key={m.key}
            to={`/mod/${m.key}`}
            className={({ isActive }) =>
              clsx(
                'flex min-w-0 shrink-0 items-center gap-2 rounded-lg border-[1.5px] px-3 py-2.5 transition-all lg:w-full',
                isActive
                  ? 'border-cyan bg-[linear-gradient(90deg,rgb(56_254_220/0.14)_0%,rgb(17_23_38/0.95)_100%)] shadow-[0_0_14px_rgb(56_254_220/0.16)]'
                  : 'border-line bg-panel hover:translate-x-0.5 hover:border-cyan/55 hover:bg-elevated',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            <span className="min-w-0 truncate text-xs font-semibold text-slate-100 sm:text-[13px]" title={m.name}>
              {m.name}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-1">
              <span className="whitespace-nowrap font-mono text-[10px] text-slate-400">{n ? `${n} rev.` : 'OK'}</span>
              <StatusDot level={worstModuleLevel(crew, m.key)} />
            </span>
          </NavLink>
        )
      })}

      <div className="mt-3 hidden space-y-2 rounded-lg border-[1.5px] border-line bg-panel/80 p-3 lg:block">
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
    </aside>
  )
}
