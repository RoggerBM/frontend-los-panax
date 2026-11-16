export default function TrialProgress({ index, total }) {
  const pct = total ? (index / total) * 100 : 0
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between font-mono text-sm uppercase tracking-wider text-slate-200">
        <span>Trial</span>
        <span>
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-cyan transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
