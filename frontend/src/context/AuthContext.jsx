import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin } from '../api/auth'
import { getMe } from '../api/users'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    // Remove any tokens left over from the old localStorage-based auth system
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    try {
      const me = await getMe()
      // Keep stored last_login up-to-date for use at next explicit login
      if (me.last_login) {
        localStorage.setItem('oas_last_login', me.last_login)
      }
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    function handleSessionExpired() {
      sessionStorage.clear()
      setUser(null)
    }
    window.addEventListener('oas:session-expired', handleSessionExpired)
    return () => window.removeEventListener('oas:session-expired', handleSessionExpired)
  }, [])

  async function login(username, password) {
    // Capture the previous login time before this new login updates it
    const prevLogin = localStorage.getItem('oas_last_login')
    await apiLogin(username, password)
    const me = await getMe()
    // Store the new last_login for the next login cycle
    if (me.last_login) {
      localStorage.setItem('oas_last_login', me.last_login)
    }
    // Signal the notification banner to check for activity since last login
    if (prevLogin && me.role === 'scout') {
      sessionStorage.setItem('oas_notify_since', prevLogin)
    }
    setUser(me)
  }

  async function logout() {
    try {
      await api.post('/auth/logout/')
    } catch {
      // Best-effort: server may be unreachable, proceed regardless
    }
    sessionStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
