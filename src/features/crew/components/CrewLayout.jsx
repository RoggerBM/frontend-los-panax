import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useVoiceCopilot } from '@/shared/hooks/useVoiceCopilot'
import { CrewProvider } from '../context/CrewProvider'
import { useCrew } from '../context/crewContext'
import BottomNav from './BottomNav'
import CrewHeader from './CrewHeader'
import ModuleSidebar from './ModuleSidebar'
import ScreensSheet from './ScreensSheet'

function buildTranscript(crew) {
  const flagged = crew.filter((c) => c.level > 0)
  const sensors = crew.filter((c) => c.sensorIssues.length)
  let text = flagged.length
    ? `Monitoring active. ${flagged.length} crew member${flagged.length > 1 ? 's' : ''} with biometric deviation: ${flagged
        .map((c) => `${c.name} (${c.flagged.map((m) => m.name.toLowerCase()).join(', ')})`)
        .join('; ')}.`
    : 'Monitoring active. All crew members within nominal parameters.'
  if (sensors.length) text += ` Check the sensor of ${sensors.map((c) => c.name).join(', ')}; not a clinical alert.`
  return text
}

function Shell() {
  const { crew, linkStatus, demoMode, setDemoMode, environment, setEnvironment, toast } = useCrew()
  const voice = useVoiceCopilot()
  const [screensOpen, setScreensOpen] = useState(false)
  const transcript = buildTranscript(crew)

  return (
    <div className="flex min-h-screen flex-col bg-hud text-slate-100 selection:bg-cyan selection:text-void">
      <CrewHeader
        crew={crew}
        linkStatus={linkStatus}
        environment={environment}
        onEnvironmentChange={setEnvironment}
        voice={voice}
        onSpeak={() => voice.speak(`AEGIS-MED medical copilot. ${transcript}`)}        transcript={transcript}
      />

      <div className="mx-auto grid w-full max-w-[1540px] flex-1 grid-cols-1 items-start gap-5 px-3 pb-28 pt-4 sm:px-5 lg:grid-cols-12">
        <ModuleSidebar crew={crew} />
        <main className="min-w-0 lg:col-span-9 xl:col-span-10">
          <Outlet />
        </main>
      </div>

      <p className="pb-24 text-center text-[11px] text-slate-500">
        Does not replace a physician or the flight surgeon · Simulated sensor data
      </p>

      <BottomNav onOpenScreens={() => setScreensOpen(true)} />
      <ScreensSheet
        open={screensOpen}
        onClose={() => setScreensOpen(false)}
        crew={crew}
        demoMode={demoMode}
        onDemoModeChange={setDemoMode}      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 animate-fade-in rounded-lg border-[1.5px] border-cyan bg-panel px-4 py-2.5 text-sm font-semibold text-cyan shadow-[0_8px_30px_rgb(0_0_0/0.6)]"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

/** Marco común de las pantallas de tripulación: cabecera, módulos y barra inferior. */
export default function CrewLayout() {
  return (
    <CrewProvider>
      <Shell />
    </CrewProvider>
  )
}
