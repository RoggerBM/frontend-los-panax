import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Exige sesión iniciada. Con `requireValidation`, además exige
 * haber completado la validación post-login.
 */
export default function ProtectedRoute({ requireValidation = false, children }) {
  const { isAuthenticated, isValidated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireValidation && !isValidated) return <Navigate to="/validacion" replace />
  return children
}
