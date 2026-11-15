const ITEMS = [
  { key: 'reaction', label: 'Reacción', hint: 'Respuesta simple' },
  { key: 'decision', label: 'Decisión', hint: 'Elegir verde/rojo' },
  { key: 'control', label: 'Control', hint: 'Con conflicto' },
]

/** Estimación de los tiempos de respuesta del operador. */
export default function ReactionTimes({ times }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {ITEMS.map((item) => (
        <div key={item.key} className="rounded-lg border border-paper/10 bg-black/15 p-3 text-center">
          <dt className="text-[10px] uppercase tracking-wider text-paper/50">{item.label}</dt>
          <dd className="mt-1 text-lg tabular-nums text-paper">
            {times[item.key] == null ? '—' : Math.round(times[item.key])}
            <span className="ml-1 text-xs text-paper/50">ms</span>
          </dd>
          <dd className="text-[10px] text-paper/40">{item.hint}</dd>
        </div>
      ))}
    </dl>
  )
}
