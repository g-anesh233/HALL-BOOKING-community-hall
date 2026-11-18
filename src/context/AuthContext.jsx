import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './sessionContext'

function readCachedUser() {
  if (!localStorage.getItem('hallbookToken')) {
    return null
  }

  try {
    return JSON.parse(localStorage.getItem('hallbookUser') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('hallbookToken')))
  const [verified, setVerified] = useState(false)

  const clearSession = useCallback(() => {
    localStorage.removeItem('hallbookLogin')
    localStorage.removeItem('hallbookToken')
    localStorage.removeItem('hallbookUser')
    setUser(null)
    setVerified(false)
  }, [])

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem('hallbookUser', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const setSession = useCallback((token, nextUser) => {
    localStorage.setItem('hallbookToken', token)
    localStorage.setItem('hallbookUser', JSON.stringify(nextUser))
    localStorage.setItem('hallbookLogin', 'true')
    setUser(nextUser)
    setVerified(true)
    setLoading(false)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('hallbookToken')

    if (!token) {
      setLoading(false)
      setUser(null)
      setVerified(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()

      if (response.status === 401) {
        clearSession()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to verify account permissions')
      }

      updateUser(data.user)
      setVerified(true)
    } catch {
      setVerified(false)
    } finally {
      setLoading(false)
    }
  }, [clearSession, updateUser])

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      refreshUser()
    }, 0)
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshUser()
      }
    }
    const refreshInterval = window.setInterval(refreshUser, 30000)

    document.addEventListener('visibilitychange', refreshOnFocus)
    return () => {
      window.clearTimeout(initialRefresh)
      window.clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [refreshUser])

  const value = useMemo(() => ({
    user,
    loading,
    verified,
    setSession,
    clearSession,
    updateUser,
    refreshUser
  }), [user, loading, verified, setSession, clearSession, updateUser, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
