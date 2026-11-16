import { Settings2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AstroCard from '../components/AstroCard'
import { useCrew } from '../context/crewContext'

/** Inicio (AEGIS): tripulación activa en cuadrícula. Cada tarjeta abre /ast/:id. */
export default function CrewHomePage() {
  const { crew, environment } = useCrew()
  const navigate = useNavigate()
  const sensorIssues = crew.flatMap((c) => c.sensorIssues.map((m) => ({ member: c, mod: m })))

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
            Active crew ({crew.length})
          </span>
          <span className="rounded border border-line bg-elevated px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300">
            {environment}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Select a crew member to see their 3D twin, modules and protocol
        </span>
      </div>

      <p className="sim-note px-1">
        <span className="sim-badge">Simulated</span>
        Crew and vitals are simulated, built on real NASA data.{' '}
        <Link to="/nasa-data">See the real data →</Link>
      </p>

      {sensorIssues.map(({ member, mod }) => (
        <button
          key={`${member.id}-${mod.key}`}
          type="button"
          onClick={() => navigate(`/ast/${member.id}`)}
          className="flex w-full items-center gap-2.5 rounded-lg border-[1.5px] border-cyan/60 bg-cyan/10 px-3.5 py-2 text-left text-xs text-cyan transition hover:bg-cyan/15"
        >
          <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            <b>Check the sensor</b> · {mod.name} of {member.name}. Not a clinical alert.
          </span>
          <span className="ml-auto shrink-0 underline">Review</span>
        </button>
      ))}

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {crew.map((m) => (
          <AstroCard key={m.id} member={m} />
        ))}
      </div>
    </section>
  )
}
