// API pública del módulo de autenticación
export { default as AuthProvider } from './context/AuthProvider'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { default as LoginPage } from './pages/LoginPage'
export { useAuth } from './hooks/useAuth'
export { getUsers, getUserById } from './services/userService'
