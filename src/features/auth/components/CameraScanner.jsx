import clsx from 'clsx'
import { CameraOff, Loader2, ShieldCheck } from 'lucide-react'

function Corner({ className }) {
  return <span className={clsx('absolute h-7 w-7 border-brand', className)} aria-hidden />
}

export default function CameraScanner({ videoRef, cameraStatus, error, scanStatus, progress, user }) {
  const scanning = scanStatus === 'scanning'
  const granted = scanStatus === 'granted'

  return (
    <div className="animate-fade-in flex flex-col items-center gap-3">
      <div
        className={clsx(
          'relative aspect-square w-full max-w-72 overflow-hidden rounded-xl border-2 bg-black/40',
          granted ? 'border-brand-soft' : 'border-brand/30',
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
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-paper/60">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            Solicitando acceso a la cámara...
          </div>
        )}

        {cameraStatus === 'error' && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-xs text-rose-300">
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
                granted ? 'border-brand-soft' : 'border-brand/60',
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
          <>
            <div className="bg-grid absolute inset-0" aria-hidden />
            <div
              className="animate-scan absolute inset-x-0 h-0.5 bg-brand-soft shadow-[0_0_16px_4px_rgb(99_102_241/0.7)]"
              aria-hidden
            />
          </>
        )}

        {granted && (
          <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/60">
            <ShieldCheck className="h-14 w-14 text-brand-soft" aria-hidden />
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-paper">
              Acceso concedido
            </p>
            {user && <p className="text-xs text-brand-soft">{user.name}</p>}
          </div>
        )}
      </div>

      {cameraStatus === 'on' && (
        <div className="w-full max-w-72">
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-paper/50">
            <span>{scanning ? 'Mantén el rostro dentro de la guía' : 'Análisis biométrico'}</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-paper/10"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
