export default function TrialProgress({ index, total }) {
  const pct = total ? (index / total) * 100 : 0
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-paper/50">
        <span>Ensayo</span>
        <span className="tabular-nums">
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-paper/10">
        <div className="h-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
