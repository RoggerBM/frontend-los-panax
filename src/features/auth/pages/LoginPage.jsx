import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ScanFace, X } from 'lucide-react'
import Button from '@/shared/components/Button'
import { useCamera } from '@/shared/hooks/useCamera'
import UserSelector from '../components/UserSelector'
import CameraScanner from '../components/CameraScanner'
import { useAuth } from '../hooks/useAuth'
import { useBiometricScan } from '../hooks/useBiometricScan'
import { getUsers } from '../services/userService'

export default function LoginPage() {
  const users = getUsers()
  const { isAuthenticated, login } = useAuth()
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? null)
  const camera = useCamera()
  const scan = useBiometricScan({
    onComplete: (user) => {
      camera.stop()
      login(user)
    },
  })

  if (isAuthenticated) return <Navigate to="/validacion" replace />

  const selectedUser = users.find((u) => u.id === selectedId) ?? null
  const busy = scan.status !== 'idle' || camera.status === 'requesting'
  const showCamera = camera.status !== 'off'

  const handleStart = async () => {
    const ok = await camera.start()
    if (ok) scan.start(selectedUser)
  }

  const handleCancel = () => {
    scan.reset()
    camera.stop()
  }

  let label = 'Iniciar escaneo'
  if (camera.status === 'requesting') label = 'Activando cámara...'
  else if (scan.status === 'scanning') label = `Escaneando... ${Math.round(scan.progress)}%`
  else if (scan.status === 'granted') label = 'Acceso concedido'
  else if (camera.status === 'error') label = 'Reintentar'

  return (
    <main className="bg-grid flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <UserSelector
          users={users}
          selectedId={selectedId}
          onSelect={setSelectedId}
          disabled={busy}
        />

        {showCamera && (
          <CameraScanner
            videoRef={camera.videoRef}
            cameraStatus={camera.status}
            error={camera.error}
            scanStatus={scan.status}
            progress={scan.progress}
            user={selectedUser}
          />
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            icon={ScanFace}
            disabled={!selectedUser || busy}
            onClick={handleStart}
          >
            {label}
          </Button>
          {showCamera && scan.status !== 'granted' && (
            <Button variant="ghost" icon={X} onClick={handleCancel} aria-label="Cancelar" />
          )}
        </div>
      </div>
    </main>
  )
}
