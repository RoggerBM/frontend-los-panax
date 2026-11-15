import { RotateCcw } from 'lucide-react'
import Button from '@/shared/components/Button'
import { ReactionTimes, VerdictBadge } from '@/features/cognitive'
import { Badge } from './ui'

const TITLES = {
  selfcheck: 'Autochequeo biométrico y cognitivo',
  countermeasures: 'Contramedidas activas (estándar NASA-STD-3001)',
  radlab: 'Telemetría NASA RadLab / OSDR en formato JSON',
}

function MiniBox({ title, titleClass = 'text-brand-soft', children }) {
  return (
    <div className="rounded-lg border border-brand/20 bg-black/25 p-3 text-xs">
      <strong className={titleClass}>{title}</strong>
      <div className="mt-1.5 text-paper/60">{children}</div>
    </div>
  )
}

function SelfCheck({ user, validation, onRepeatValidation }) {
  return (
    <div className="mt-2.5 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
      <div className="flex flex-col gap-2.5 rounded-lg border border-brand/20 bg-black/25 p-3">
        <strong className="text-xs text-brand-soft">1. Validación cognitiva (PVT + Go/No-Go + Stroop)</strong>
        <VerdictBadge verdict={validation.verdict} compact />
        <ReactionTimes times={validation.times} />
        <Button variant="ghost" icon={RotateCcw} onClick={onRepeatValidation}>
          Repetir validación
        </Button>
      </div>
      <MiniBox title="2. Cribado ocular SANS (Amsler)">
        <p className="mb-2">Sin metamorfopsia ni escotomas centrales reportados por {user.name}.</p>
        <Badge tone="ok">Sin edema papilar</Badge>
      </MiniBox>
      <MiniBox title="3. Integridad de traje y sensores">
        <p className="mb-2">Sellado de casco nominal • Batería módulo biométrico 97%.</p>
        <Badge tone="ok">Listo para EVA</Badge>
      </MiniBox>
    </div>
  )
}

function Countermeasures() {
  return (
    <div className="mt-2.5 grid gap-3 md:grid-cols-3">
      <MiniBox title="Ejercicio resistivo y aeróbico" titleClass="text-brand">
        ARED (sentadilla y peso muerto orbital) 45 min + CEVIS 30 min para frenar pérdida ósea y muscular.
      </MiniBox>
      <MiniBox title="Iluminación circadiana SSL">
        Espectro enriquecido en azul (6500K) durante turno activo; transición a 2700K 2 horas antes de dormir.
      </MiniBox>
      <MiniBox title="Blindaje de radiación ALARA" titleClass="text-amber-400">
        Barreras de agua y polietileno de alta densidad en literas de descanso de la tripulación.
      </MiniBox>
    </div>
  )
}

function RadLabJson({ payload }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md border border-brand/20 bg-black/40 p-2.5 text-[11px] text-brand-soft">
      {JSON.stringify(payload, null, 2)}
    </pre>
  )
}

export default function SubviewPanel({ view, onClose, user, validation, payload, onRepeatValidation }) {
  return (
    <section className="animate-fade-in rounded-xl border border-brand/45 bg-black/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-soft">{TITLES[view]}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-brand bg-brand/15 px-2.5 py-1 text-[11px] font-semibold text-brand-soft hover:bg-brand/25"
        >
          Volver al panel principal
        </button>
      </div>
      {view === 'selfcheck' && (
        <SelfCheck user={user} validation={validation} onRepeatValidation={onRepeatValidation} />
      )}
      {view === 'countermeasures' && <Countermeasures />}
      {view === 'radlab' && <RadLabJson payload={payload} />}
    </section>
  )
}
