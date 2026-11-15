export default function TrialProgress({ index, total }) {
  const pct = total ? (index / total) * 100 : 0
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
        <span>Trial</span>
        <span>
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-cyan transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
