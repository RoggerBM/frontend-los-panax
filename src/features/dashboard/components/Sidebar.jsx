import clsx from 'clsx'
import { Braces, LayoutGrid, Shield, Timer } from 'lucide-react'
import { SCENARIOS, SCENARIO_KEYS } from '../config/scenarios'
import { StatusDot } from './ui'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel de comando', icon: LayoutGrid },
  { id: 'selfcheck', label: 'Autochequeo', icon: Timer },
  { id: 'countermeasures', label: 'Contramedidas', icon: Shield },
  { id: 'radlab', label: 'NASA RadLab y JSON', icon: Braces },
]

function SectionTitle({ children, right }) {
  return (
    <div className="mb-2 flex items-center justify-between text-[10px] tracking-wider text-paper/40">
      <span>{children}</span>
      {right}
    </div>
  )
}

export default function Sidebar({ view, onViewChange, scenario, onScenarioChange }) {
  return (
    <aside className="flex flex-col gap-4.5 border-b border-brand/20 bg-black/25 px-3 py-3.5 lg:border-r lg:border-b-0">
      <div>
        <SectionTitle>SISTEMAS DE MISIÓN</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const Icon = icon
            return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={clsx(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                view === id
                  ? 'border-brand/45 bg-gradient-to-r from-brand/20 to-brand/5 font-semibold text-brand-soft'
                  : 'border-transparent text-paper/60 hover:bg-brand/5 hover:text-paper',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
            )
          })}
        </div>
      </div>

      <div>
        <SectionTitle right={<span className="text-brand">EN VIVO</span>}>SIMULACIÓN DE RIESGOS</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {SCENARIO_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onScenarioChange(key)}
              className={clsx(
                'flex items-center justify-between rounded-lg border px-2.5 py-2 text-left text-[11px] transition-all',
                scenario === key
                  ? 'border-brand bg-brand/10 font-semibold text-paper'
                  : 'border-brand/20 bg-black/20 text-paper/60 hover:border-brand/45 hover:text-paper',
              )}
            >
              {SCENARIOS[key].label}
              <StatusDot tone={SCENARIOS[key].tone} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-lg border border-brand/20 bg-brand/5 p-2.5 text-[10px] leading-relaxed text-paper/60">
        <strong className="text-brand-soft">ESTÁNDAR NASA-STD-3001</strong>
        <br />
        Motor edge autónomo sin dependencia terrestre. Sensores biométricos + dosimetría ISS RadLab sincronizados.
      </div>
    </aside>
  )
}
