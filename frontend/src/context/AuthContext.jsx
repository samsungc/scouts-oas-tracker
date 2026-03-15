import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin } from '../api/auth'
import { getMe } from '../api/users'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!api.getAccessToken()) {
      setIsLoading(false)
      return
    }
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      api.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  async function login(username, password) {
    await apiLogin(username, password)
    const me = await getMe()
    setUser(me)
  }

  function logout() {
    api.clearTokens()
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
