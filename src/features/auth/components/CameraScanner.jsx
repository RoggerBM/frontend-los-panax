import clsx from 'clsx'
import { CameraOff, Loader2, ShieldCheck } from 'lucide-react'

function Corner({ className }) {
  return <span className={clsx('absolute h-7 w-7 border-cyan', className)} aria-hidden />
}

/** Visor de cámara con guía facial, láser de escaneo y barra de progreso (paleta AEGIS). */
export default function CameraScanner({ videoRef, cameraStatus, error, scanStatus, progress, user }) {
  const scanning = scanStatus === 'scanning'
  const granted = scanStatus === 'granted'

  return (
    <div className="animate-fade-in flex flex-col items-center gap-3">
      <div
        className={clsx(
          'relative aspect-square w-full max-w-72 overflow-hidden rounded-xl border-2 bg-void',
          granted ? 'border-lime' : 'border-cyan/40',
        )}
      >
        {cameraStatus === 'on' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={clsx(
              'h-full w-full -scale-x-100 object-cover transition duration-500',
              scanning && 'contrast-110 saturate-50',
            )}
          />
        )}

        {cameraStatus === 'requesting' && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan" aria-hidden />
            Requesting camera access...
          </div>
        )}

        {cameraStatus === 'error' && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-xs text-[#FF6B6B]">
            <CameraOff className="h-8 w-8" aria-hidden />
            {error}
          </div>
        )}

        {cameraStatus === 'on' && (
          <>
            {/* Guía para encuadrar el rostro */}
            <div
              className={clsx(
                'absolute left-1/2 top-1/2 h-[68%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed transition-colors',
                granted ? 'border-lime' : 'border-cyan/70',
              )}
              aria-hidden
            />
            <Corner className="left-3 top-3 border-l-2 border-t-2" />
            <Corner className="right-3 top-3 border-r-2 border-t-2" />
            <Corner className="bottom-3 left-3 border-b-2 border-l-2" />
            <Corner className="bottom-3 right-3 border-b-2 border-r-2" />
          </>
        )}

        {scanning && (
          <div
            className="animate-scan absolute inset-x-0 h-0.5 bg-cyan shadow-[0_0_16px_4px_rgb(56_254_220/0.7)]"
            aria-hidden
          />
        )}

        {granted && (
          <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/70">
            <ShieldCheck className="h-14 w-14 text-lime" aria-hidden />
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white">Identity verified</p>
            {user && <p className="text-xs text-lime">{user.name}</p>}
          </div>
        )}
      </div>

      {cameraStatus === 'on' && (
        <div className="w-full max-w-72">
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <span>{scanning ? 'Keep your face inside the guide' : 'Biometric analysis'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-cyan transition-[width] duration-75" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
