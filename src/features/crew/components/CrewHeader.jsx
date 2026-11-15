import clsx from 'clsx'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNow } from '@/shared/hooks/useNow'
import { ENVIRONMENTS } from '../config/scenarios'
import { missionDay } from '../config/mission'
import { statusOf } from '../config/status'

const LINK = {
  live: { label: 'LIVE SENSORS', cls: 'border-lime/40 bg-lime/10 text-lime', dot: 'bg-lime animate-pulse' },
  connecting: { label: 'CONNECTING…', cls: 'border-cyan/40 bg-cyan/10 text-cyan', dot: 'bg-cyan animate-ping' },
  offline: { label: 'NO LINK • LOCAL', cls: 'border-caution/40 bg-caution/10 text-caution', dot: 'bg-caution' },
  disabled: { label: 'LOCAL SIMULATION', cls: 'border-line bg-panel text-slate-400', dot: 'bg-slate-500' },
}

function MedicalCross() {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-cyan bg-cyan/10 shadow-[0_0_15px_rgb(56_254_220/0.2)]"
      title="Biomedical station"
    >
      <svg className="h-6 w-6 text-cyan" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3z" />
      </svg>
    </div>
  )
}

export default function CrewHeader({ crew, linkStatus, environment, onEnvironmentChange, voice, onSpeak, transcript, showTranscript }) {
  const navigate = useNavigate()
  const now = useNow()
  const day = missionDay(now)

  const flagged = crew.filter((c) => c.level > 0)
  const worst = crew.reduce((acc, c) => (c.level > (acc?.level ?? -1) ? c : acc), null)
  const banner = statusOf(flagged.length ? worst.level : 0)
  const link = LINK[linkStatus] ?? LINK.disabled

  const date = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <header className="sticky top-0 z-40 w-full border-b-[1.5px] border-line bg-inset/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1540px] grid-cols-1 items-center gap-3 px-3 py-2.5 sm:px-5 lg:grid-cols-12">
        <div className="flex items-center justify-between gap-3 lg:col-span-3 lg:justify-start">
          <div className="flex items-center gap-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Crew monitoring // HUD</span>
              <h1 className="text-lg font-extrabold leading-tight tracking-wide text-white sm:text-xl">Space-Qhealth</h1>
            </div>
            <MedicalCross />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="font-mono text-[11px] font-semibold tracking-wider text-slate-300 sm:text-xs">
              {date} &nbsp;•&nbsp; {time} LOC &nbsp;•&nbsp;{' '}
              <span className="text-cyan">DAY {String(day).padStart(3, '0')} IN SPACE</span>
            </div>
            <select
              value={environment}
              onChange={(e) => onEnvironmentChange(e.target.value)}
              aria-label="Mission environment"
              className="cursor-pointer rounded border border-cyan/50 bg-panel px-2 py-0.5 font-mono text-[10.5px] font-bold text-cyan outline-none"
            >
              {ENVIRONMENTS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => worst && flagged.length && navigate(`/ast/${worst.id}`)}
            className="flex w-full max-w-2xl items-center justify-between gap-2 rounded-lg border-[1.5px] px-3.5 py-1.5 text-left transition-all"
            style={{ borderColor: banner.hex, backgroundColor: `${banner.hex}1a` }}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={clsx('h-2.5 w-2.5 shrink-0 rounded-full', flagged.length && 'animate-critical')}
                style={{ backgroundColor: banner.hex }}
              />
              <span className="shrink-0 font-mono text-[11px] font-bold uppercase text-slate-200">
                {flagged.length ? 'Alert:' : 'Status:'}
              </span>
              <span className="truncate text-xs font-semibold sm:text-[13px]" style={{ color: banner.fg }}>
                {flagged.length
                  ? `${flagged.length} crew member${flagged.length > 1 ? 's' : ''} need${flagged.length > 1 ? '' : 's'} review (${flagged.map((c) => c.name).join(' • ')})`
                  : 'All crew members nominal'}
              </span>
            </span>
            {flagged.length > 0 && (
              <span className="shrink-0 rounded bg-critical px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                {flagged.length} REV.
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:col-span-3 lg:justify-end">
          <span
            className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold', link.cls)}
            title="Link to the sensor backend"
          >
            <span className={clsx('h-1.5 w-1.5 rounded-full', link.dot)} />
            {link.label}
          </span>
          <button
            type="button"
            onClick={onSpeak}
            disabled={!voice.supported}
            title={voice.supported ? 'Play voice report' : 'Your browser does not support speech synthesis'}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-cyan/60 px-2.5 py-1.5 text-[11px] font-bold text-cyan transition disabled:opacity-40',
              voice.speaking ? 'bg-cyan/25' : 'bg-panel hover:bg-cyan/15',
            )}
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden /> AI Voice
          </button>
        </div>
      </div>

      {showTranscript && (
        <div className="mx-auto max-w-[1540px] border-t border-line/80 bg-void px-4 py-1">
          <p className="truncate font-mono text-[11px] text-cyan" title={transcript}>
            [SPACE-QHEALTH AI]: {transcript}
          </p>
        </div>
      )}
    </header>
  )
}
