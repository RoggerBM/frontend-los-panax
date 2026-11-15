import clsx from 'clsx'
import { TONE_CLASSES } from '../config/colors'
import { Badge, Card, CardHeader } from './ui'

const ROWS = [
  { key: 'rad', label: 'Flujo de radiación espacial (OSDR)' },
  { key: 'neuro', label: 'Riesgo neuro-fatiga y ocular SANS' },
  { key: 'cardio', label: 'Cardiovascular y cambio de fluidos 0g' },
]

export default function RiskIndex({ risks }) {
  return (
    <Card>
      <CardHeader title="Índice de riesgo NASA-STD-3001">
        <Badge tone="info">Tiempo real</Badge>
      </CardHeader>
      <div className="mt-1.5 flex flex-col gap-2.5">
        {ROWS.map(({ key, label }) => {
          const [pct, level, tone] = risks[key]
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between gap-2 text-[11px]">
                <span className="text-paper/80">{label}</span>
                <strong className={clsx('whitespace-nowrap', TONE_CLASSES[tone].text)}>
                  {level} ({pct}%)
                </strong>
              </div>
              <div className="h-[5px] overflow-hidden rounded bg-paper/10">
                <div
                  className={clsx('h-full rounded transition-all duration-500', TONE_CLASSES[tone].bg)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
