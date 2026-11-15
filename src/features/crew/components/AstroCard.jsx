import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { statusOf } from '../config/status'
import AstronautPortrait from './AstronautPortrait'
import EcgStrip from './EcgStrip'
import { Heart, StatusTag } from './ui'

const GLOW = {
  0: 'border-lime shadow-[0_0_22px_rgb(80_239_57/0.10),inset_0_0_18px_rgb(80_239_57/0.04)]',
  1: 'border-caution shadow-[0_0_22px_rgb(245_245_87/0.12),inset_0_0_18px_rgb(245_245_87/0.05)]',
  2: 'border-critical shadow-[0_0_24px_rgb(197_17_17/0.24),inset_0_0_20px_rgb(197_17_17/0.08)]',
}

/** Tarjeta de tripulante de la pantalla de inicio (AEGIS). Abre /ast/:id. */
export default function AstroCard({ member }) {
  const navigate = useNavigate()
  const st = statusOf(member.level)
  const r = member.readings
  const lostEcg = member.modules.cardio.st < 0
  const eva = member.location === 'EVA'

  return (
    <button
      type="button"
      onClick={() => navigate(`/ast/${member.id}`)}
      className={clsx(
        'group flex w-full flex-col items-center rounded-2xl border-[1.5px] bg-[linear-gradient(180deg,#131B2E_0%,#0E1422_100%)] p-3.5 text-left transition-transform duration-200 hover:-translate-y-[3px] sm:p-4',
        GLOW[member.level],
      )}
    >
      <div className="mb-2 flex w-full items-center justify-between gap-2">
        <span className="truncate text-xs font-extrabold uppercase tracking-wide text-white transition-colors group-hover:text-cyan sm:text-sm">
          {member.name}        </span>
        <StatusTag level={member.level} short />
      </div>

      <div
        className="relative h-32 w-32 overflow-hidden rounded-xl border-[1.5px] shadow-inner sm:h-36 sm:w-36"
        style={{ borderColor: st.hex }}
      >
        {member.hasPhoto ? (
          <>
            <img src={member.image} alt={`Photo of ${member.name}`} className="h-full w-full object-cover" />
            {/* Marco HUD sobre la foto, como en el retrato por defecto */}
            <svg viewBox="0 0 180 180" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id={`shade-${member.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="55%" stopColor="#090D16" stopOpacity="0" />
                  <stop offset="100%" stopColor="#090D16" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              <rect width="180" height="180" fill={`url(#shade-${member.id})`} />
              <path
                d="M14 22h14M14 22v14M166 22h-14M166 22v14M14 158h14M14 158v-14M166 158h-14M166 158v-14"
                stroke="#38FEDC"
                strokeOpacity="0.7"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </>
        ) : (
          <AstronautPortrait stripe={member.suitStripe} statusHex={st.hex} />
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded border border-line bg-void/85 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-slate-200">
          SpO₂ {r.spo2}%
        </span>
      </div>

      <div className="mb-1.5 mt-2 text-center">
        <div className="text-xs font-bold text-slate-100 sm:text-[13px]">{member.role}</div>
        <div className="font-mono text-[10px] text-slate-400">
          BP {r.bp_sys}/{r.bp_dia} • Gluc {r.glucose} • Sleep {r.sleep_hours.toFixed(1)}h
        </div>
      </div>

      <div className="mt-1 w-full space-y-1.5">
        <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-void px-3 py-1.5">
          <Heart bpm={lostEcg ? 0 : r.hr} className="h-4 w-4" />
          <EcgStrip bpm={r.hr} color={st.hex} lost={lostEcg} className="h-5 min-w-0 flex-1" />
          <span className="shrink-0 font-mono text-xs font-bold" style={{ color: st.fg }}>
            {lostEcg ? '— BPM' : `${r.hr} BPM`}
          </span>
        </div>
        <div className="flex w-full items-center justify-between rounded-lg border border-line bg-void px-3 py-1.5 text-xs">
          <span className="text-slate-400">
            Location:{' '}
            <strong className={clsx('font-mono', eva ? 'text-orange' : 'text-cyan')}>{eva ? 'Outside (EVA)' : 'Ship'}</strong>
          </span>
          <span className="font-mono text-[10.5px] text-slate-300">
            Mood: <strong>{member.mood}</strong>
          </span>
        </div>
      </div>
    </button>
  )
}
