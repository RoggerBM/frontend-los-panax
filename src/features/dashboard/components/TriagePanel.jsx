import { Badge, Card, CardHeader } from './ui'

export default function TriagePanel({ triage }) {
  return (
    <Card>
      <CardHeader title="Protocolo de triaje autónomo">
        <Badge tone={triage.tone}>{triage.tag}</Badge>
      </CardHeader>
      <div>
        <p className="mb-1 text-[13.5px] font-bold text-paper">{triage.title}</p>
        <p className="mb-2 text-[11px] text-paper/60">{triage.reason}</p>
        <ul className="list-disc pl-4 text-[11px] leading-relaxed text-paper/90">
          {triage.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
