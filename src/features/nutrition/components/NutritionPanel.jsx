import clsx from 'clsx'
import { AlertTriangle, Check, Droplets, Nut, SatelliteDish, Send, SkipForward, Utensils, X } from 'lucide-react'
import { useState } from 'react'
import { LEVEL_HEX, LINKS, LOG_ENTRIES, analyze, applyLog, recommendations } from '../lib/nutritionModel'
import { useNutrition } from '../context/nutritionContext'
import { EnergyChart, MassChart, RiskGauge } from './charts'

const STATUS_LABEL = ['Nominal', 'Caution', 'Alert']
const STATUS_ICON = [Check, AlertTriangle, X]
const LOG_ICONS = { meal: Utensils, snack: Nut, water: Droplets, skip: SkipForward }
const QUICK_QUESTIONS = ['What should I eat now?', 'Why did I lose weight?', 'Am I drinking enough water?', 'When do we notify Earth?']

function Pnl({ title, badge, children, className }) {
  return (
    <section className={clsx('rounded-xl border-[1.5px] border-line bg-panel p-3.5', className)}>
      {title && (
        <h3 className="mb-1 flex flex-wrap items-center gap-2 text-sm font-bold text-white">
          {title}
          {badge}
        </h3>
      )}
      {children}
    </section>
  )
}

function Badge({ color, children }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold"
      style={{ borderColor: color, color, backgroundColor: `${color}22` }}
    >
      {children}
    </span>
  )
}

const Note = ({ children, className }) => <p className={clsx('text-[11.5px] text-slate-400', className)}>{children}</p>

function queueStatus(q, linkKey, now) {
  if (q.reply) return { text: 'Answered', color: LEVEL_HEX[0] }
  if (q.sent) {
    const total = LINKS[linkKey].delayMs ?? 0
    const left = Math.max(0, Math.round((total - (now - q.sent)) / 1000))
    return { text: `Sent · reply in ~${linkKey === 'slow' ? '28 min' : '3 s'} (demo ${left}s)`, color: LEVEL_HEX[1] }
  }
  return { text: 'Queued · will send when the signal returns', color: LEVEL_HEX[2] }
}

/**
 * Vista completa "Nutrition · On-board AI": monitoreo, análisis explicable, recomendaciones,
 * registro rápido, asistente y mensajes a Tierra. crew: [{ id, name, image }]
 */
export default function NutritionPanel({ crew, onlyId, onToast = () => {} }) {
  const { profiles: allProfiles, analyses, link, setLink, queue: allQueue, now, done, chats, logEntry, markDone, enqueue, ask } =
    useNutrition()
  // onlyId: vista de una sola persona (desde su ficha), sin selector ni datos de otros
  const profiles = onlyId ? allProfiles.filter((p) => p.id === onlyId) : allProfiles
  const queue = onlyId ? allQueue.filter((q) => q.crewId === onlyId) : allQueue
  const [selectedId, setSelectedId] = useState(() => {
    if (onlyId) return onlyId
    // Por defecto, el tripulante con peor estado nutricional
    const worst = profiles.slice().sort((a, b) => analyses[b.id].st - analyses[a.id].st || analyses[b.id].risk - analyses[a.id].risk)[0]
    return worst?.id ?? null
  })
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')

  const R = analyses[selectedId]
  if (!R) return null
  const recs = recommendations(R, done)
  const chat = chats[selectedId] ?? []
  const member = crew.find((c) => c.id === selectedId)
  const nameOf = (id) => crew.find((c) => c.id === id)?.name ?? id

  const handleLog = (kind) => {
    // Se calcula el nuevo riesgo para el aviso (el estado global se actualiza en el mismo clic)
    const next = analyze(R.a, applyLog(R.D, kind))
    logEntry(selectedId, kind)
    onToast(`${LOG_ENTRIES[kind].label} logged · AI recalculated: risk ${next.risk}/100`)
  }

  const handleAsk = (text) => {
    const q = (text ?? question).trim()
    if (!q) {
      setError('Type a question first.')
      return
    }
    setError('')
    ask(selectedId, q)
    setQuestion('')
  }

  const kpis = [
    {
      level: R.ec,
      label: 'Energy · 7-day average',
      value: `${Math.round(R.e7 * 100)}%`,
      sub: `${R.kcal7} of ${R.a.kcal} kcal/day`,
    },
    {
      level: R.wc,
      label: 'Water · 7-day average',
      value: `${(R.w7 / 1000).toFixed(1)} L`,
      sub: `NASA goal ≥${(R.wT / 1000).toFixed(1)} L/day`,
    },
    {
      level: R.mc,
      label: 'Body mass vs pre-flight',
      value: `${R.mPct > 0 ? '+' : ''}${R.mPct.toFixed(1)}%`,
      sub: `30-day projection: ${R.m30Pct > 0 ? '+' : ''}${R.m30Pct.toFixed(1)}%`,
    },
    {
      level: R.st,
      label: 'Nutrition status',
      value: STATUS_LABEL[R.st],
      icon: STATUS_ICON[R.st],
      sub: R.st === 2 ? 'Earth is notified' : R.st === 1 ? 'Handled on board' : 'Logged only',
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold text-white">Nutrition · On-board AI</h2>
        <p className="max-w-3xl text-xs text-slate-400">
          Monitors what each astronaut eats and drinks, analyzes the trend and recommends what to do now. Everything is computed
          on the ship: if the link with Earth is lost, it keeps working and stores messages to send later.
        </p>
      </div>

      {/* Tripulante, IA y enlace con Tierra */}
      <div className="flex flex-wrap items-center gap-2">
        {!onlyId && profiles.map((p) => {
          const st = analyses[p.id].st
          const c = crew.find((x) => x.id === p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              aria-pressed={p.id === selectedId}
              className={clsx(
                'flex items-center gap-2 rounded-full border-[1.5px] py-1 pl-1 pr-3 text-xs font-semibold transition',
                p.id === selectedId ? 'border-cyan bg-cyan/15 text-white' : 'border-line bg-panel text-slate-300 hover:border-cyan/60',
              )}
            >
              {c?.image && <img src={c.image} alt="" className="h-6 w-6 rounded-full object-cover" />}
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LEVEL_HEX[st] }} />
              {p.name}
            </button>
          )
        })}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan px-2.5 py-1 text-[11px] font-semibold text-cyan">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" /> On-board AI active · offline
        </span>
        <div className="ml-auto flex gap-1 rounded-xl border border-line bg-panel p-1" title="Simulates the link with Earth">
          {Object.entries(LINKS).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setLink(k)
                onToast(`Link: ${v.label}. The on-board AI keeps working.`)
              }}
              className={clsx(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] transition',
                k === link ? 'font-bold text-void' : 'text-slate-400 hover:text-slate-200',
              )}
              style={k === link ? { backgroundColor: v.color } : undefined}
            >
              <SatelliteDish className="h-3.5 w-3.5" aria-hidden /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="border-[1.5px] border-l-4 border-line bg-panel p-3" style={{ borderLeftColor: LEVEL_HEX[k.level] }}>
              <small className="block text-[11px] text-slate-400">{k.label}</small>
              <b className="flex items-center gap-1.5 text-2xl" style={{ color: LEVEL_HEX[k.level] }}>
                {Icon && <Icon className="h-5 w-5" strokeWidth={3} aria-hidden />}
                {k.value}
              </b>
              <small className="block text-[11px] text-slate-400">{k.sub}</small>
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Pnl title="Monitoring · daily energy" badge={<Badge color="#38FEDC">Simulated</Badge>}>
            <EnergyChart R={R} />
            <Note>
              Each bar is one day; hover for detail. The dashed lines mark the goal and the real average of ISS crews.
            </Note>
          </Pnl>

          <Pnl title="Body mass and projection">
            <MassChart R={R} />
            <Note>
              On the ISS, mass is measured with a device that applies a known force (SLAMMD), because scales do not work in
              microgravity.
            </Note>
          </Pnl>

          <Pnl title="Log now">
            <Note>Each entry updates the analysis instantly, even without signal.</Note>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {Object.entries(LOG_ENTRIES).map(([k, v]) => {
                const Icon = LOG_ICONS[k]
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleLog(k)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan"
                  >
                    <Icon className="h-4 w-4 text-cyan" aria-hidden /> {k === 'skip' ? 'I skipped a meal' : v.label}
                  </button>
                )
              })}
            </div>
          </Pnl>

          <Pnl title="Ask the AI">
            <div className="max-h-64 space-y-1.5 overflow-auto rounded-lg border border-line bg-void p-2.5 text-sm" aria-live="polite">
              {chat.length ? (
                chat.map(([who, text], i) => (
                  <div
                    key={i}
                    className={clsx(
                      'max-w-[92%] rounded-lg px-2.5 py-1.5',
                      who === 'u' ? 'ml-auto bg-cyan font-medium text-void' : 'bg-panel text-slate-200',
                    )}
                  >
                    {text}
                  </div>
                ))
              ) : (
                <Note>Answers with {member?.name ?? R.a.name}&apos;s data, computed on board.</Note>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAsk(t)}
                  className="rounded-full border border-line bg-void px-3 py-1 text-[11.5px] text-slate-300 transition hover:border-cyan hover:text-cyan"
                >
                  {t}
                </button>
              ))}
            </div>
            <form
              className="mt-2 flex gap-1.5"
              onSubmit={(e) => {
                e.preventDefault()
                handleAsk()
              }}
            >
              <input
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value)
                  setError('')
                }}
                placeholder="Type your question"
                aria-label="Question for the on-board AI"
                className="flex-1 rounded-lg border border-line bg-void px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-3 py-2 text-xs font-bold text-white transition hover:bg-cobalt/60"
              >
                <Send className="h-4 w-4" aria-hidden /> Send
              </button>
            </form>
            {error && <p className="mt-1 text-xs text-[#FF6B6B]">{error}</p>}
          </Pnl>

          <Pnl title="Messages to Earth" badge={<Badge color={LINKS[link].color}>{LINKS[link].label}</Badge>}>
            {queue.length ? (
              <ul>
                {queue.map((q) => {
                  const s = queueStatus(q, link, now)
                  return (
                    <li key={q.id} className="flex items-start gap-2.5 border-b border-line py-2 text-xs last:border-0">
                      <div className="min-w-0 text-slate-200">
                        <b>{nameOf(q.crewId)}</b> · {q.txt}
                        {q.reply && <p className="mt-0.5 text-[11.5px] text-lime">{q.reply}</p>}
                      </div>
                      <span className="ml-auto shrink-0 font-semibold" style={{ color: s.color }}>
                        {s.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Note>No messages. Alerts are sent automatically; without signal they stay queued.</Note>
            )}
          </Pnl>
        </div>

        <div className="space-y-3">
          <Pnl title="AI analysis">
            <div className="flex items-center gap-3.5">
              <RiskGauge R={R} />
              <div>
                <b className="text-sm text-white">Nutrition risk</b>
                <Note>A weighted sum of factors. Each number shows how much it adds, so the crew understands why.</Note>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-[minmax(0,150px)_1fr_40px] items-center gap-x-2.5 gap-y-1.5 text-xs">
              {R.C.map(([n, v]) => {
                const c = v >= 10 ? LEVEL_HEX[2] : v >= 4 ? LEVEL_HEX[1] : LEVEL_HEX[0]
                return (
                  <div key={n} className="contents">
                    <span className="truncate text-slate-300" title={n}>
                      {n}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-void">
                      <i className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, (v / 30) * 100)}%`, backgroundColor: c }} />
                    </div>
                    <span className="text-right font-mono text-slate-400">+{Math.round(v)}</span>
                  </div>
                )
              })}
            </div>
            <Note className="mt-2">
              Compared with their own normal in the first 2 weeks, energy is {R.z.toFixed(1)} standard deviations away.
            </Note>
          </Pnl>

          <Pnl title="Recommendations now">
            {recs.slice(0, 4).map((r) => {
              const c = LEVEL_HEX[r.p]
              const Icon = STATUS_ICON[r.p]
              return (
                <div
                  key={r.id}
                  className="mt-2 animate-fade-in rounded-xl border-[1.5px] px-3 py-2.5"
                  style={{ borderColor: c, background: `linear-gradient(${c}14, ${c}14), #0B101B` }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: c }} strokeWidth={2.6} aria-hidden />
                    {r.t}
                  </div>
                  <p className="mb-2 mt-1 text-xs text-slate-400">
                    <b className="text-slate-300">Why:</b> {r.w}
                    <br />
                    <b className="text-slate-300">How:</b> {r.how.join(' · ')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        markDone(selectedId, r.id)
                        onToast('Done. The AI will verify it with the next entries.')
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-cyan bg-cobalt/40 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cobalt/60"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> Done
                    </button>
                    {r.p === 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          enqueue(selectedId, r.t)
                          onToast('Message queued for Earth')
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-line bg-void px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan"
                      >
                        <SatelliteDish className="h-3.5 w-3.5" aria-hidden /> Notify Earth
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <Note className="mt-2">Medications or doses are never given, except the vitamin D supplement in the mission plan.</Note>
          </Pnl>
        </div>
      </div>

      <Pnl title="How the on-board AI works">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {[
              ['Monitoring', 'Logs meals, water, appetite and supplements (like the app used on the ISS today), body mass and exercise minutes.'],
              [
                'Analysis',
                '7-day averages, 14-day trend, comparison with their own normal and a 30-day mass projection. Risk is a weighted sum of factors, so every recommendation says why.',
              ],
              ['Recommendations', 'Rules based on NASA requirements, ordered by priority. Recomputed with every entry.'],
              ['Offline', 'Everything runs on the ship. With delay or no signal, alerts stay queued and send themselves; Earth reviews and confirms when they arrive.'],
              ['Next step', 'A small language model running on ship hardware to converse more freely, trained with each mission’s data.'],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-line last:border-0">
                <td className="w-36 py-1.5 pr-2 align-top font-bold text-slate-200">{k}</td>
                <td className="py-1.5 text-slate-400">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note className="mt-2">
          Goals: NASA JSC-67378 (individual energy, water ≥2.5 L/day for men and ≥2.1 L/day for women, vitamin D 25 µg/day). Real
          reference: ISS crews eat ~80% of what they need and lose mass (Zwart et al., 2014). The crew on this screen is simulated.
          Not a medical device.
        </Note>
      </Pnl>
    </div>
  )
}
