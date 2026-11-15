import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, ProtectedRoute } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { ValidationPage } from '@/features/cognitive'

// Flujo: /login -> /validacion -> /dashboard
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/validacion"
        element={
          <ProtectedRoute>
            <ValidationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireValidation>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
