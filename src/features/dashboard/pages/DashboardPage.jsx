import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { TONE_HEX } from '../config/colors'
import { CALLOUT_PROTOCOLS, ENVIRONMENTS, SCENARIOS, VERDICT_FATIGUE } from '../config/scenarios'
import { useVoiceCopilot } from '../hooks/useVoiceCopilot'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import HoloScanner from '../components/HoloScanner'
import EcgMonitor from '../components/EcgMonitor'
import RiskIndex from '../components/RiskIndex'
import TriagePanel from '../components/TriagePanel'
import SubviewPanel from '../components/SubviewPanel'

const sleepPctFor = (hours) => Math.min(100, Math.max(45, Math.round((hours / 8) * 100)))

export default function DashboardPage() {
  const { user, loginAt, logout, validation, resetValidation } = useAuth()
  const voice = useVoiceCopilot()

  const [scenarioKey, setScenarioKey] = useState('nominal')
  const [view, setView] = useState('dashboard')
  const [mode, setMode] = useState('astronaut')
  const [env, setEnv] = useState(ENVIRONMENTS[0])
  const [step, setStep] = useState('detect')
  const [sleepOverride, setSleepOverride] = useState(null)
  const [focus, setFocus] = useState(null)

  const s = SCENARIOS[scenarioKey]

  const selectScenario = (key) => {
    setScenarioKey(key)
    setSleepOverride(null)
    setFocus(null)
  }

  // Sueño: el slider sobrescribe el valor del escenario
  const sleepHours = sleepOverride ?? s.sleep.hours
  const sleepPct = sleepOverride == null ? s.sleep.pct : sleepPctFor(sleepOverride)

  // Fatiga: PVT real medido en la validación post-login; el slider proyecta el efecto del sueño
  const measuredPvt = Math.round(validation?.times?.reaction ?? s.sans.pvt)
  const pvt =
    sleepOverride == null ? measuredPvt : Math.max(220, Math.round(measuredPvt + (s.sleep.hours - sleepOverride) * 28))
  const fatigue = VERDICT_FATIGUE[validation?.verdict ?? 'ok']

  const triage = focus ? { ...CALLOUT_PROTOCOLS[focus], tone: 'info' } : s.triage
  const envShort = env.split('•')[0].trim()

  const callouts = {
    cns: `PVT ${pvt}ms • ${fatigue.badge[0]}`,
    rad: `${s.rad.value} mSv/d • ${s.rad.badge[0]}`,
    cardio: `${s.cardio.hr} LPM • VFC ${s.cardio.hrv}ms`,
    metab: `${s.nutri.gluc} mg/dL • ${s.nutri.water}`,
  }

  const radlabPayload = {
    mission: 'ISS_EXPEDITION_74',
    crew_id: user.crewCode,
    crew_name: user.name,
    gravity_mode: env,
    vitals: {
      heart_rate_bpm: s.cardio.hr,
      core_temp_c: Number(s.temp.value),
      spo2_pct: Number(s.spo2.match(/\d+/)?.[0]),
      pvt_reaction_ms: pvt,
    },
    validation: validation && {
      verdict: validation.verdict,
      reaction_ms: Math.round(validation.times.reaction ?? 0),
      decision_ms: Math.round(validation.times.decision ?? 0),
      control_ms: Math.round(validation.times.control ?? 0),
    },
    radlab_telemetry: {
      dose_rate_msv_day: Number(s.rad.value),
      alara_status: s.rad.badge[0],
      career_limit_msv: 600,
    },
  }

  const speakReport = () =>
    voice.speak(
      `Copiloto médico AEGIS-MED activo. ${user.name}, frecuencia cardíaca ${s.cardio.hr} latidos por minuto, ` +
        `temperatura corporal ${s.temp.value} grados Celsius, ` +
        `radiación espacial en ${s.rad.value} milisieverts por día, ` +
        `y tiempo de reacción de ${pvt} milisegundos. ${triage.title}.`,
    )

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_50%_35%,rgb(79_70_229/0.08)_0%,transparent_70%)]">
      <TopBar
        user={user}
        loginAt={loginAt}
        eva={s.eva}
        step={step}
        onStepChange={setStep}
        env={env}
        onEnvChange={setEnv}
        voice={voice}
        onSpeak={speakReport}
        onLogout={logout}
      />

      <div className="grid flex-1 lg:grid-cols-[205px_1fr]">
        <Sidebar view={view} onViewChange={setView} scenario={scenarioKey} onScenarioChange={selectScenario} />

        <main className="flex min-w-0 flex-col gap-3 p-3">
          {view !== 'dashboard' && (
            <SubviewPanel
              view={view}
              onClose={() => setView('dashboard')}
              user={user}
              validation={validation}
              payload={radlabPayload}
              onRepeatValidation={resetValidation}
            />
          )}

          {/* Fila superior */}
          <div className="grid gap-3 xl:grid-cols-[270px_1fr_270px]">
            <div className="flex flex-col gap-3">
              <MetricCard
                title="Cardiovascular y 0G"
                badge={s.cardio.badge}
                value={s.cardio.hr}
                unit="LPM"
                sub={s.cardio.sub}
                pct={s.cardio.pct}
              />
              <MetricCard
                title="Inmunología y temp."
                badge={s.temp.badge}
                value={s.temp.value}
                unit="°C"
                sub={s.temp.sub}
                pct={s.temp.pct}
              />
              <MetricCard
                title="Sueño y LED circadiano"
                badge={s.sleep.badge}
                value={sleepHours.toFixed(1)}
                unit="HRS"
                sub={s.sleep.sub}
                pct={sleepPct}
              >
                <label className="mt-2 flex items-center gap-2 text-[10.5px] text-paper/60">
                  Sim. sueño:
                  <input
                    type="range"
                    min="4"
                    max="9"
                    step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepOverride(Number(e.target.value))}
                    className="h-1 flex-1 cursor-pointer accent-brand"
                  />
                  <span className="w-8 text-right tabular-nums text-brand-soft">{sleepHours.toFixed(1)}h</span>
                </label>
              </MetricCard>
            </div>

            <HoloScanner
              mode={mode}
              onModeChange={setMode}
              accent={TONE_HEX[s.triage.tone === 'info' ? 'ok' : s.triage.tone]}
              callouts={callouts}
              selected={focus}
              onSelect={setFocus}
              envLabel={envShort}
            />

            <div className="flex flex-col gap-3">
              <MetricCard
                title="Radiación espacial (RadLab)"
                badge={s.rad.badge}
                value={s.rad.value}
                unit="mSv/d"
                sub={s.rad.sub}
                pct={s.rad.pct}
              />
              <MetricCard
                title="Fatiga y visión SANS"
                badge={fatigue.badge}
                value={pvt}
                unit="ms PVT"
                sub={sleepOverride == null ? `Medido en tu validación • ${s.sans.sub}` : 'Proyección según horas de sueño'}
                pct={fatigue.pct}
              />
              <MetricCard
                title="Nutrición e hidratación"
                badge={s.nutri.badge}
                value={s.nutri.gluc}
                unit="mg/dL"
                sub={s.nutri.sub}
                pct={s.nutri.pct}
              />
            </div>
          </div>

          {/* Fila inferior */}
          <div className="grid gap-3 xl:grid-cols-[1.05fr_1fr_1fr]">
            <EcgMonitor bpm={s.cardio.hr} spo2={s.spo2} />
            <RiskIndex risks={s.risks} />
            <TriagePanel triage={triage} />
          </div>
        </main>
      </div>
    </div>
  )
}
