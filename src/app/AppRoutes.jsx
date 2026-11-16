import { Navigate, Route, Routes } from 'react-router-dom'
import { ValidationPage } from '@/features/cognitive'
import { AstronautPage, CrewHomePage, CrewLayout, EmergencyPage, ModulePage } from '@/features/crew'
import { NasaDataPage } from '@/features/nasaData'

// Sin login: "/" abre el panel. La validación biométrica solo se pide al hacer un test.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CrewLayout />}>
        <Route index element={<CrewHomePage />} />
        <Route path="ast/:crewId" element={<AstronautPage />} />
        <Route path="mod/fat/test" element={<ValidationPage />} />
        <Route path="mod/:moduleKey" element={<ModulePage />} />
        <Route path="emergencia" element={<EmergencyPage />} />
        <Route path="nasa-data" element={<NasaDataPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
