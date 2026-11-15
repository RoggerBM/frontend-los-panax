import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { getUserById } from '../services/userService'

const STORAGE_KEY = 'mission-control.session'

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const user = useMemo(() => (session ? getUserById(session.userId) : null), [session])

  const login = useCallback((u) => {
    const next = { userId: u.id, loginAt: Date.now() }
    setSession(next)
    writeSession(next)
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    writeSession(null)
  }, [])

  const updateValidation = useCallback((validation) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, validation }
      writeSession(next)
      return next
    })
  }, [])

  /** Guarda el resultado de la validación post-login (habilita el panel). */
  const completeValidation = useCallback((v) => updateValidation(v), [updateValidation])
  /** Obliga a repetir la validación. */
  const resetValidation = useCallback(() => updateValidation(null), [updateValidation])

  const value = useMemo(
    () => ({
      user,
      loginAt: session?.loginAt ?? null,
      isAuthenticated: Boolean(user),
      validation: session?.validation ?? null,
      isValidated: Boolean(session?.validation),
      login,
      logout,
      completeValidation,
      resetValidation,
    }),
    [user, session, login, logout, completeValidation, resetValidation],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
