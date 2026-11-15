const ITEMS = [
  { key: 'reaction', label: 'Reaction', hint: 'Simple response' },
  { key: 'decision', label: 'Decision', hint: 'Green vs. red' },
  { key: 'control', label: 'Control', hint: 'Under conflict' },
]

/** Estimación de los tiempos de respuesta del operador. */
export default function ReactionTimes({ times }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {ITEMS.map((item) => (
        <div key={item.key} className="rounded-lg border border-line bg-void p-3 text-center">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{item.label}</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-white">
            {times?.[item.key] == null ? '—' : Math.round(times[item.key])}
            <span className="ml-1 text-xs font-normal text-slate-400">ms</span>
          </dd>
          <dd className="text-[10px] text-slate-500">{item.hint}</dd>
        </div>
      ))}
    </dl>
  )
}
