import clsx from 'clsx'
import { ArrowLeft, ScanFace, X } from 'lucide-react'
import { useCamera } from '@/shared/hooks/useCamera'
import { useBiometricScan } from '../hooks/useBiometricScan'
import CameraScanner from './CameraScanner'

const btn =
  'inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Validación biométrica reutilizable: escaneo facial con la cámara antes de un test.
 * onVerified({ at, userId }) se llama al conceder la identidad; onCancel vuelve atrás.
 */
export default function BiometricCheck({ user, testName, onVerified, onCancel }) {
  const camera = useCamera()
  const scan = useBiometricScan({
    onComplete: (u) => {
      camera.stop()
      onVerified({ at: Date.now(), userId: u.id })
    },
  })

  const busy = scan.status !== 'idle' || camera.status === 'requesting'
  const showCamera = camera.status !== 'off'

  const handleStart = async () => {
    const ok = await camera.start()
    if (ok) scan.start(user)
  }

  const handleCancel = () => {
    scan.reset()
    camera.stop()
  }

  let label = 'Verify identity'
  if (camera.status === 'requesting') label = 'Starting camera...'
  else if (scan.status === 'scanning') label = `Scanning... ${Math.round(scan.progress)}%`
  else if (scan.status === 'granted') label = 'Identity verified'
  else if (camera.status === 'error') label = 'Retry'

  const lastLog = scan.logs[scan.logs.length - 1]

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img src={user.image} alt="" className="h-12 w-12 rounded-lg border-[1.5px] border-cyan/60 object-cover" />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Biometric validation</p>
          <h2 className="text-base font-extrabold text-white">Confirm it is you, {user.name.split(' ')[0]}</h2>
          <p className="text-xs text-slate-400">
            A face scan is required before {testName ? `the ${testName}` : 'each test'} so the result is linked to the right crew
            member.
          </p>
        </div>
      </div>

      {showCamera && (
        <CameraScanner
          videoRef={camera.videoRef}
          cameraStatus={camera.status}
          error={camera.error}
          scanStatus={scan.status}
          progress={scan.progress}
          user={user}
        />
      )}

      {lastLog && (
        <p
          className={clsx(
            'text-center font-mono text-[11px]',
            lastLog.level === 'ok' ? 'text-lime' : lastLog.level === 'warn' ? 'text-caution' : 'text-slate-400',
          )}
          aria-live="polite"
        >
          {lastLog.text}
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && !busy && (
          <button type="button" onClick={onCancel} className={clsx(btn, 'border-line bg-void text-slate-200 hover:border-cyan hover:text-cyan')}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
        )}
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className={clsx(btn, 'flex-1 border-cyan bg-cobalt/40 text-white hover:bg-cobalt/60')}
        >
          <ScanFace className="h-4 w-4" aria-hidden /> {label}
        </button>
        {showCamera && scan.status !== 'granted' && (
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancel scan"
            className={clsx(btn, 'border-line bg-void px-3 text-slate-300 hover:border-critical hover:text-[#FF6B6B]')}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
