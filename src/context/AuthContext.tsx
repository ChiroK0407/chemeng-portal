import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import type { Profile } from '@/types'

// Create a configured local axios client targeting your fresh Node backend layer
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Automatically attach your custom JWT token to out-bound API calls if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface AuthUser {
  id: string
  email: string
  role: string
}

interface AuthContextValue {
  user:             AuthUser | null
  profile:          Profile | null
  isLoading:        boolean
  isAdmin:          boolean
  signUp:           (email: string, password: string, meta?: Record<string, any>) => Promise<void>
  signIn:           (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
  refreshProfile:   () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch current user information using the protected /me token validation loop
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      if (response.data?.success) {
        const { id, email, role, profile: fetchedProfile } = response.data.data
        setUser({ id, email, role })
        setProfile(fetchedProfile)
      }
    } catch (error) {
      console.error('Session validation thread failed. Clearing tokens.', error)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const signUp = async (email: string, password: string, meta?: Record<string, any>) => {
    // Collect full name safely from your form registration structure
    const fullName = meta?.full_name || 'Anonymous Engineer'
    
    const response = await api.post('/auth/register', { email, password, fullName })
    if (response.data?.success) {
      const { accessToken, refreshToken, user: registeredUser } = response.data.data
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(registeredUser)
      await fetchCurrentUser()
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data?.success) {
      const { accessToken, refreshToken, user: loggedUser } = response.data.data
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(loggedUser)
      setProfile(loggedUser.profile)
    }
  }

  const signInWithGoogle = async () => {
    throw new Error('OAuth loop handling with custom backends requires passport or dedicated redirection clients.')
  }

  const signOut = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    await fetchCurrentUser()
  }

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      user, profile, isLoading, isAdmin,
      signUp, signIn, signInWithGoogle, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>')
  return ctx
}