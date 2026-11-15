import { LayoutList } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NutritionProvider } from '@/features/nutrition'
import Starfield from '@/shared/components/Starfield'
import { useVoiceCopilot } from '@/shared/hooks/useVoiceCopilot'
import { CrewProvider } from '../context/CrewProvider'
import { useCrew } from '../context/crewContext'
import BottomNav from './BottomNav'
import CrewHeader from './CrewHeader'
import ModuleSidebar from './ModuleSidebar'
import ScreensSheet from './ScreensSheet'

const NAV_KEY = 'aegis.nav.open'

function readNavOpen() {
  try {
    return localStorage.getItem(NAV_KEY) !== '0'
  } catch {
    return true
  }
}

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
  const { pathname } = useLocation()
  const voice = useVoiceCopilot()
  const [screensOpen, setScreensOpen] = useState(false)
  const isHome = pathname === '/'
  // Preferencia guardada (solo la cambia el botón en el inicio); en el resto de vistas la barra se pliega sola
  const [navPref, setNavPref] = useState(readNavOpen)
  const [navOpen, setNavOpen] = useState(() => isHome && readNavOpen())
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const transcript = buildTranscript(crew)

  // Cualquier selección que navega (ficha, módulo, test, emergencia, accesos…) oculta la barra
  useEffect(() => {
    setNavOpen(isHome && navPref)
    setMobileNavOpen(false)
  }, [pathname, isHome, navPref])

  const toggleNav = useCallback(() => {
    const next = !navOpen
    setNavOpen(next)
    if (!isHome) return // fuera del inicio, abrirla es temporal
    setNavPref(next)
    try {
      localStorage.setItem(NAV_KEY, next ? '1' : '0')
    } catch {
      /* preferencia solo en memoria */
    }
  }, [navOpen, isHome])

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="relative isolate flex min-h-screen flex-col text-slate-100 selection:bg-cyan selection:text-void">
      <Starfield />
      <CrewHeader
        crew={crew}
        linkStatus={linkStatus}
        environment={environment}
        onEnvironmentChange={(env) => {
          setEnvironment(env)
          setNavOpen(false)
        }}
        voice={voice}
        onSpeak={() => voice.speak(`Space Q-Health medical copilot. ${transcript}`)}
        transcript={transcript}
        showTranscript={isHome}
      />

      <div className="mx-auto flex w-full max-w-[1540px] flex-1 items-start gap-5 px-3 pb-28 pt-4 sm:px-5">
        <ModuleSidebar
          crew={crew}
          open={navOpen}
          onToggle={toggleNav}
          onSelect={() => setNavOpen(false)}
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
        />
        <main className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border-[1.5px] border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan hover:text-cyan lg:hidden"
          >
            <LayoutList className="h-4 w-4 text-cyan" aria-hidden /> Modules
          </button>
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
        onDemoModeChange={(mode) => {
          setDemoMode(mode)
          setNavOpen(false)
        }}
      />

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
    <NutritionProvider>
      <CrewProvider>
        <Shell />
      </CrewProvider>
    </NutritionProvider>
  )
}
