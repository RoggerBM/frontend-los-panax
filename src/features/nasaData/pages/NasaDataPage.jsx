import clsx from 'clsx'
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CREW_COLORS, DATA, RL, TIME_POINTS, fmtPct, fmtVal, mean, preFlight } from '../data/nasaData'

const OK = '#3ecf8e'
const CAU = '#f5b83d'
const WAR = '#ff5d5d'
const INFO = '#5aa9ff'
const ACC = '#e8ff5a'
const MUTED = '#93a0b8'

const Badge = ({ kind }) => (
  <span
    className="rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
    style={kind === 'real' ? { color: OK, borderColor: `${OK}59`, backgroundColor: `${OK}24` } : { color: INFO, borderColor: `${INFO}59`, backgroundColor: `${INFO}1f` }}
  >
    {kind === 'real' ? 'Real' : 'Simulated'}
  </span>
)

function Panel({ title, badge, src, children }) {
  return (
    <section className="rounded-2xl border-[1.5px] border-line bg-panel p-4 sm:p-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <h2 className="mr-1.5 text-lg font-bold text-white">{title}</h2>
        {badge && <Badge kind={badge} />}
        {src && <span className="text-[12.5px] text-slate-400">{src}</span>}
      </div>
      {children}
    </section>
  )
}

const Chip = ({ on, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={clsx('rounded-full border px-3 py-1.5 text-[13px] transition', on ? 'border-[#e8ff5a] text-white' : 'border-line text-slate-200 hover:border-slate-400')}
    style={on ? { boxShadow: `0 0 0 1px ${ACC} inset` } : undefined}
  >
    {children}
  </button>
)

const Kpi = ({ label, value, sub, color }) => (
  <div className="rounded-xl border border-line bg-void p-3">
    <small className="block text-xs text-slate-400">{label}</small>
    <b className="my-0.5 block font-mono text-xl" style={color ? { color } : undefined}>
      {value}
    </b>
    <small className="block text-xs text-slate-400">{sub}</small>
  </div>
)

const Note = ({ children }) => (
  <div className="mt-3 rounded-r-lg border-l-[3px] px-3 py-2.5 text-sm text-slate-200" style={{ borderColor: ACC, backgroundColor: 'rgb(232 255 90 / 0.05)' }}>
    <b>Why it matters:</b> {children}
  </div>
)

/* ---------------- Radiación: misma tormenta, distinto entorno (RadLab + DONKI) ---------------- */

function RadChart({ rk }) {
  const w = 1000
  const h = 270
  const n = RL.days.length
  const lo = Math.log10(3)
  const hi = Math.log10(2000)
  const px = (i) => 60 + (i * (w - 90)) / (n - 1)
  const py = (v) => h - 34 - ((Math.log10(v) - lo) / (hi - lo)) * (h - 58)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Daily radiation dose by environment, May 2024">
      {[3, 10, 30, 100, 300, 1000].map((t) => (
        <g key={t}>
          <line x1="60" x2={w - 30} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,.08)" />
          <text x="54" y={py(t) + 4} textAnchor="end" fontSize="12" fill={MUTED}>
            {t}
          </text>
        </g>
      ))}
      {DATA.DK.gst.map(([t, kp]) => {
        const i = RL.days.indexOf(t.slice(0, 10))
        if (i < 0) return null
        const x = px(i) + ((+t.slice(11, 13) / 24) * (w - 90)) / (n - 1)
        return (
          <g key={t}>
            <line x1={x} x2={x} y1="22" y2={h - 34} stroke={ACC} strokeOpacity="0.35" strokeDasharray="4 4" />
            <text x={x + 4} y="32" fontSize="11" fill={ACC} fillOpacity="0.8">
              Kp {+kp.toFixed(1)}
            </text>
          </g>
        )
      })}
      {RL.days.map((d, i) =>
        i % 2 === 0 ? (
          <text key={d} x={px(i)} y={h - 10} textAnchor="middle" fontSize="12" fill={MUTED}>
            May {+d.slice(8)}
          </text>
        ) : null,
      )}
      {Object.keys(RL.raw).map((k) => {
        const on = k === rk
        const [nm, , c] = RL.meta[k]
        return (
          <g key={k}>
            <polyline
              points={RL.raw[k].map((v, i) => `${px(i)},${py(v)}`).join(' ')}
              fill="none"
              stroke={c}
              strokeWidth={on ? 3.5 : 1.6}
              strokeOpacity={on ? 1 : 0.4}
            />
            {RL.raw[k].map((v, i) => (
              <circle key={i} cx={px(i)} cy={py(v)} r={on ? 4.5 : 2.5} fill={c} fillOpacity={on ? 1 : 0.45}>
                <title>{`${nm} · May ${+RL.days[i].slice(8)}: ${fmtVal(v)} μGy/h (${(v / RL.base[k]).toFixed(1)}× its normal)`}</title>
              </circle>
            ))}
          </g>
        )
      })}
      <text x="62" y="14" fontSize="12" fill={MUTED}>
        μGy/h · log scale · dashed lines = geomagnetic storms (NASA DONKI)
      </text>
    </svg>
  )
}

function RadiationSection() {
  const [rk, setRk] = useState('lro')
  const [nm, ins] = RL.meta[rk]
  const a = RL.raw[rk]
  const mx = Math.max(...a)
  const i = a.indexOf(mx)
  const x = mx / RL.base[rk]
  const hot = x > 3
  return (
    <Panel
      title="Same solar storm, different environment"
      badge="real"
      src={`NASA OSDR · RadLab · 4 instruments · May 5–20, 2024 · + NASA DONKI (${DATA.DK.sep} solar particle events)`}
    >
      <div className="mb-3 mt-1.5 flex flex-wrap gap-2">
        {Object.keys(RL.meta).map((z) => (
          <Chip key={z} on={z === rk} onClick={() => setRk(z)}>
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: RL.meta[z][2] }} />
            {RL.meta[z][0]}
          </Chip>
        ))}
      </div>
      <RadChart rk={rk} />
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
        <Kpi label={`${nm} · April normal`} value={`${fmtVal(RL.base[rk])} μGy/h`} sub={ins} />
        <Kpi label="Storm peak" value={`${fmtVal(mx)} μGy/h`} sub={`May ${+RL.days[i].slice(8)}, 2024`} color={hot ? WAR : OK} />
        <Kpi
          label="Times above its own normal"
          value={`×${x < 10 ? x.toFixed(1) : Math.round(x)}`}
          sub={hot ? 'Go to the shelter and notify Earth' : "No real change: Earth's magnetic field protects the ISS"}
          color={hot ? WAR : OK}
        />
      </div>
      <Note>
        the storm was barely noticeable on the ISS, while the dose in lunar orbit rose about 290 times. That is why Space-QHealth changes the
        radiation alert with the selected environment. The Mars peak on May 20 is a different solar eruption aimed at Mars. Each instrument
        measures differently, so each one is compared with its own normal, not with the others.
      </Note>
    </Panel>
  )
}

/* ---------------- Inspiration4: cada cuerpo es distinto ---------------- */

function I4Chart({ mk }) {
  const V = DATA.I4.vars[mk]
  const w = 1000
  const h = 280
  const T = TIME_POINTS
  const all = [V.rango[0], V.rango[1]]
  for (const c in DATA.I4.crew) DATA.I4.crew[c][mk].forEach((p) => p[1] != null && all.push(p[1]))
  let lo = Math.min(...all)
  let hi = Math.max(...all)
  const pd = (hi - lo) * 0.12
  lo -= pd
  hi += pd
  const px = (i) => 70 + (i * (w - 110)) / (T.length - 1)
  const py = (v) => h - 36 - ((v - lo) / (hi - lo)) * (h - 60)
  const fl = (px(2) + px(3)) / 2
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={`${V.nombre} of the Inspiration4 crew before and after flight`}>
      <rect x="60" y={py(V.rango[1])} width={w - 90} height={py(V.rango[0]) - py(V.rango[1])} fill="rgba(255,255,255,.05)" />
      <text x={w - 34} y={py(V.rango[1]) + 14} textAnchor="end" fontSize="11" fill={MUTED}>
        population reference range
      </text>
      <line x1={fl} x2={fl} y1="20" y2={h - 36} stroke={ACC} strokeOpacity="0.5" strokeDasharray="4 4" />
      <text x={fl} y="16" textAnchor="middle" fontSize="11" fill={ACC}>
        3-day orbital flight
      </text>
      {Array.from({ length: 5 }, (_, t) => {
        const v = lo + ((hi - lo) * t) / 4
        return (
          <text key={t} x="54" y={py(v) + 4} textAnchor="end" fontSize="12" fill={MUTED}>
            {+v.toFixed(v < 20 ? 1 : 0)}
          </text>
        )
      })}
      {T.map((t, i) => (
        <text key={t} x={px(i)} y={h - 12} textAnchor="middle" fontSize="12" fill={MUTED}>
          {t}
        </text>
      ))}
      {Object.keys(DATA.I4.crew).map((c) => {
        const pts = DATA.I4.crew[c][mk].map((p) => [T.indexOf(p[0]), p[1]]).filter((p) => p[1] != null && p[0] >= 0)
        const b = mean(preFlight(c, mk))
        return (
          <g key={c}>
            <line x1={px(0)} x2={px(2)} y1={py(b)} y2={py(b)} stroke={CREW_COLORS[c]} strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
            <polyline points={pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={CREW_COLORS[c]} strokeWidth="2.4" />
            {pts.map((p) => (
              <circle key={p[0]} cx={px(p[0])} cy={py(p[1])} r="4.5" fill={CREW_COLORS[c]}>
                <title>{`${c} · ${T[p[0]]}: ${p[1]} ${V.unidad}${p[0] >= 3 ? ` (${fmtPct((p[1] / b - 1) * 100)} vs. own pre-flight)` : ''}`}</title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function Inspiration4Section() {
  const [mk, setMk] = useState('linfocitos')
  const V = DATA.I4.vars[mk]
  const ch = Object.keys(DATA.I4.crew)
    .map((c) => {
      const r = DATA.I4.crew[c][mk].find((p) => p[0] === 'R+1')
      return [c, r && r[1] != null ? (r[1] / mean(preFlight(c, mk)) - 1) * 100 : null, r ? r[1] : null]
    })
    .filter((x) => x[1] != null)
  const avg = mean(ch.map((x) => x[1]))
  const big = ch.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a))
  const inRange = big[2] >= V.rango[0] && big[2] <= V.rango[1]
  return (
    <Panel title="Every body is different" badge="real" src="NASA OSDR · Inspiration4 (OSD-575, OSD-569) · 4 crew members, 7 time points">
      <div className="mb-3 mt-1.5 flex flex-wrap gap-2">
        {Object.keys(DATA.I4.vars).map((z) => (
          <Chip key={z} on={z === mk} onClick={() => setMk(z)}>
            {DATA.I4.vars[z].nombre}
          </Chip>
        ))}
      </div>
      <I4Chart mk={mk} />
      <div className="mt-1 flex flex-wrap gap-2 text-[12.5px] text-slate-400">
        {Object.keys(CREW_COLORS).map((c) => (
          <span key={c}>
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: CREW_COLORS[c] }} />
            {c}
          </span>
        ))}
        <span>· thick bar = each person&apos;s own pre-flight normal</span>
      </div>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
        <Kpi label={`${V.nombre} · crew average, day after return`} value={fmtPct(avg)} sub="vs. each person's pre-flight normal" />
        <Kpi
          label="Largest individual change"
          value={`${big[0]} ${fmtPct(big[1])}`}
          sub={`${big[2]} ${V.unidad} · ${inRange ? 'still “normal” by population range' : 'outside the population range'}`}
        />
        <Kpi label="Population reference range" value={`${V.rango[0]}–${V.rango[1]}`} sub={V.unidad} />
      </div>
      <Note>
        after only 3 days in orbit, values shifted differently in each person, and many changes stay inside the population range, so a fixed
        range would miss them. Space-QHealth compares each astronaut with their own baseline and recalibrates it during the mission.
      </Note>
    </Panel>
  )
}

/* ---------------- Tablas ---------------- */

const HAZARDS = [
  ['Altered gravity fields', 'Cardiovascular adaptations · bone and muscle loss', 'Heart rate, blood pressure, exercise minutes', 'Re-measure at rest, countermeasure exercise, gravity-readiness card before landing'],
  ['Isolation & confinement', 'Sleep loss · behavioral conditions', 'Sleep hours, mood, stress, reaction test (PVT)', 'Sleep hygiene, contact with crew and family, lighter workload'],
  ['Hostile closed environment', 'Altered immune response · inadequate food', 'Body temperature, symptoms, meals, water, glucose (mg/dL)', 'Rest and hydration, track symptoms, notify Earth if it persists'],
  ['Space radiation', 'Radiation-induced cancer and acute effects', 'Daily and cumulative dose vs. 600 mSv career limit', 'Shelter during solar events, postpone EVA, notify Earth'],
  ['Distance from Earth', 'No real-time medical help', 'Communication delay of the chosen environment', 'Assessment and actions work on board and offline'],
]

const LEVELS = [
  ['Nominal', OK, 'Logged only.'],
  ['Caution', CAU, 'Handled on board: re-measure and follow the action card.'],
  ['Critical', WAR, 'Notify Earth now, with the real delay. Also if Caution lasts 3 days or 2 systems are affected at once.'],
  ['Check sensor', INFO, 'The reading is discarded and never triggers a clinical alarm.'],
]

const Ext = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#5aa9ff] hover:underline">
    {children}
    <ExternalLink className="h-3 w-3" aria-hidden />
  </a>
)

const SOURCES = [
  [
    <>
      <Ext href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575">NASA OSDR · OSD-575 / OSD-569</Ext> <Badge kind="real" />
    </>,
    'Blood panels of the 4 Inspiration4 crew members at 7 time points',
    'Personal baselines, day-to-day variability, immune and nutrition modules',
  ],
  [
    <>
      <Ext href="https://visualization.osdr.nasa.gov/radlab/gui/overview/">NASA OSDR · RadLab</Ext> <Badge kind="real" />
    </>,
    'Radiation dose measured on the ISS, in lunar orbit, deep space and on Mars',
    'Radiation module per environment',
  ],
  [
    <>
      <Ext href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/">NASA DONKI</Ext> <Badge kind="real" />
    </>,
    'Space-weather events of the May 2024 solar storm',
    'Solar-storm demo and shelter alert',
  ],
  [
    <>
      <Ext href="https://www.nasa.gov/hrp/hazards/">NASA HRP · hazards</Ext> and <Ext href="https://www.nasa.gov/hrp/risks/">risks</Ext>
    </>,
    '5 hazards and the human-health risks of spaceflight',
    'Choice of indicators, explanations and actions',
  ],
  ['NASA-STD-3001 Vol. 1', 'Crew health standard', '600 mSv career radiation limit'],
  ['NASA JSC-67378', 'Spaceflight nutrition requirements', 'Nutrition module targets'],
  [
    <Ext key="csa" href="https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp">
      Canadian Space Agency
    </Ext>,
    'Radiation monitoring of astronauts on the ISS',
    'Context for the radiation risk',
  ],
]

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-line px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className="border-b border-line px-2 py-2.5 align-top text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** "Real space-agency data behind Space-QHealth" (contenido de nasa-data.html). */
export default function NasaDataPage() {
  return (
    <section className="animate-fade-in mx-auto max-w-[1080px] space-y-4">
      <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-200">NASA Data</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] font-light tracking-[0.22em] text-slate-400">
          <b className="font-semibold text-slate-100">SPACE-QHEALTH</b> · NASA DATA
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-slate-100 transition hover:border-[#e8ff5a]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to the app
        </Link>
      </header>

      <div>
        <h1 className="mb-1.5 mt-2 text-2xl font-semibold text-white sm:text-3xl">Real space-agency data behind Space-QHealth</h1>
        <p className="max-w-3xl text-slate-400">
          Public data from NASA shows why the app compares each astronaut with their <em>own</em> normal and why radiation alerts change with
          the environment. Everything on this page is <Badge kind="real" /> data. The crew shown inside the app is <Badge kind="sim" />, built
          on top of these values.
        </p>
      </div>

      <RadiationSection />
      <Inspiration4Section />

      <Panel title="5 HRP hazards → what Space-QHealth monitors" src="NASA Human Research Program">
        <Table head={['HRP hazard', 'HRP risk', 'Indicator in the app', 'Typical action']} rows={HAZARDS} />
      </Panel>

      <Panel title="When to alert the crew or Earth">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map(([label, color, text]) => (
            <div key={label} className="rounded-xl border border-line bg-void p-3 text-sm text-slate-200">
              <b className="mb-0.5 block" style={{ color }}>
                {label}
              </b>
              {text}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="How we use each source">
        <Table head={['Source', 'What it is', 'Used for']} rows={SOURCES} />
      </Panel>

      <footer className="space-y-1 border-t border-line pt-3.5 text-[12.5px] text-slate-400">
        <p>
          Data and visualizations are courtesy of the RadLab Portal (https://visualization.osdr.nasa.gov/radlab/gui/overview/). Inspiration4 data:
          NASA Open Science Data Repository, OSD-575 and OSD-569. The L-92 sample of crew member C003 is excluded because several of its values
          appear shifted between columns.
        </p>
        <p>NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites.</p>
        <p>
          Space-QHealth is a hackathon prototype for NASA Space Apps Challenge 2026. It is not a medical device and never gives medication doses;
          it supports the flight surgeon and does not replace them.
        </p>
      </footer>
    </section>
  )
}
