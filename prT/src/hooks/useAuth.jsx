import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../api/client'
import {
  setUser,
  setAuthLoading,
  clearAuth,
} from '../store/authSlice'

export function AuthProvider({ children }) {
  const { reloadUser, logout } = useAuth()

  useEffect(() => {
    reloadUser()
  }, [reloadUser])

  useEffect(() => {
    window.addEventListener('auth:logout', logout)

    return () => {
      window.removeEventListener('auth:logout', logout)
    }
  }, [logout])

  return children
}

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)

  const reloadUser = useCallback(async () => {
    const access = localStorage.getItem('access')

    if (!access) {
      dispatch(setUser(null))
      dispatch(setAuthLoading(false))
      return
    }

    dispatch(setAuthLoading(true))

    try {
      const response = await api.get('auth/me/')
      dispatch(setUser(response.data))
    } catch {
      dispatch(setUser(null))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }, [dispatch])

  const login = useCallback(async (tokens) => {
    localStorage.setItem('access', tokens.access)
    localStorage.setItem('refresh', tokens.refresh)

    await reloadUser()
  }, [reloadUser])

  const logout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    dispatch(clearAuth())
  }, [dispatch])

  return {
    user,
    loading,
    login,
    logout,
    reloadUser,
  }
}