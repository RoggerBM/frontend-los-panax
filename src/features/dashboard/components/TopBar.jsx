import clsx from 'clsx'
import { LogOut, Volume2 } from 'lucide-react'
import Avatar from '@/shared/components/Avatar'
import LiveClock from '@/shared/components/LiveClock'
import { TONE_CLASSES } from '../config/colors'
import { ENVIRONMENTS, PIPELINE_STEPS } from '../config/scenarios'
import MissionClock from './MissionClock'

function Logo() {
  return (
    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-brand bg-brand/15 shadow-[0_0_14px_rgb(99_102_241/0.35)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#E0E7FF" />
        <path d="M8 12h2l1.5-3 2 6 1.5-3H17" stroke="#6366F1" />
      </svg>
    </div>
  )
}

export default function TopBar({
  user,
  loginAt,
  eva,
  step,
  onStepChange,
  env,
  onEnvChange,
  voice,
  onSpeak,
  onLogout,
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/20 bg-black/30 px-4 py-2">
      <div className="flex min-w-[195px] items-center gap-2.5">
        <Logo />
        <div>
          <p className="text-[15px] font-extrabold tracking-wider text-paper">AEGIS-MED</p>
          <p className="text-[10px] tracking-wide text-brand-soft">BIO-OS ORBITAL v4.0</p>
        </div>
      </div>

      <nav className="flex items-center gap-2" aria-label="Pipeline">
        {PIPELINE_STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStepChange(s.id)}
            className={clsx(
              'rounded-md border px-2.5 py-1 text-left text-[10px] leading-tight transition-all',
              step === s.id
                ? 'border-brand bg-brand/10 text-brand-soft shadow-[0_0_10px_rgb(99_102_241/0.25)]'
                : 'border-brand/20 bg-black/20 text-paper/60 hover:border-brand hover:text-brand-soft',
            )}
          >
            {s.label[0]}
            <br />
            {s.label[1]}
          </button>
        ))}
      </nav>

      <div className="border-x border-brand/20 px-2.5 py-1 text-[11px] leading-tight text-paper/60">
        MET
        <MissionClock since={loginAt} className="block text-xs font-bold text-paper tabular-nums" />
        <LiveClock className="block text-[10px] tabular-nums" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-2.5 py-1 text-[10px] font-bold tracking-wide text-brand">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-brand shadow-[0_0_8px_rgb(99_102_241)]" />
          TRANSMISIÓN EN VIVO
        </span>

        <select
          value={env}
          onChange={(e) => onEnvChange(e.target.value)}
          title="Entorno orbital"
          className="cursor-pointer rounded-md border border-brand/20 bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-paper outline-none focus:border-brand"
        >
          {ENVIRONMENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSpeak}
          disabled={!voice.supported}
          title={voice.supported ? 'Reporte por voz en español' : 'Tu navegador no soporta síntesis de voz'}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-md border border-brand/45 px-2.5 py-1.5 text-[11px] font-semibold text-brand-soft transition-all disabled:opacity-40',
            voice.speaking ? 'bg-brand/25 shadow-[0_0_12px_rgb(99_102_241/0.45)]' : 'bg-brand/10 hover:bg-brand/25',
          )}
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden /> Copiloto de voz
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-black/20 px-2.5 py-1">
          <Avatar src={user.image} alt={user.name} size="xs" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-paper">{user.name}</p>
            <p className={clsx('text-[9.5px]', TONE_CLASSES[eva.tone].text)}>{eva.label}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="rounded-md border border-rose-500/40 p-1.5 text-rose-300 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </header>
  )
}
