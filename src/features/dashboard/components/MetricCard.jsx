import { Badge, Card, CardHeader, Donut } from './ui'

/** Tarjeta de métrica: título + insignia, valor grande, detalle y anillo de porcentaje. */
export default function MetricCard({ title, badge, value, unit, sub, pct, children }) {
  const [badgeLabel, tone] = badge
  return (
    <Card>
      <CardHeader title={title}>
        <Badge tone={tone}>{badgeLabel}</Badge>
      </CardHeader>
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <p className="text-[26px] font-extrabold leading-tight tracking-tight text-paper tabular-nums">
            {value}
            <span className="ml-1 text-xs font-semibold text-paper/60">{unit}</span>
          </p>
          <p className="mt-1 text-[11px] text-paper/60">{sub}</p>
        </div>
        <Donut pct={pct} tone={tone} />
      </div>
      {children}
    </Card>
  )
}
