import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/lib/axios'

interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'member' | 'admin'
  is_verified: boolean
}

interface AuthContextValue {
  user:      AuthUser | null
  isLoading: boolean
  isAdmin:   boolean
  signUp:  (email: string, password: string, fullName: string) => Promise<void>
  signIn:  (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  profile:        any
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Data collected on the signup form (name/stream/type/roll number) is
// cached here just before the Google button navigates the browser away
// to accounts.google.com — see GoogleSignInButton.tsx's onBeforeNavigate.
// sessionStorage (not React state) is what survives that round trip,
// since the whole page unloads for a real OAuth redirect. Consumed
// exactly once, by whichever page the user lands back on after Google
// sign-in succeeds — see the effect in fetchCurrentUser below.
export const PENDING_JOIN_STORAGE_KEY = 'chell_pending_member_join'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fires at most once per signup: if there's cached join-form data
  // waiting (password signup never sets this — it joins synchronously
  // in SignupPage.tsx instead — only the Google path needs this), send
  // it to /members/join now that we know for certain the user is
  // actually signed in. Failures here are swallowed deliberately: the
  // most likely failure is 409 ALREADY_JOINED (e.g. the effect firing
  // twice in dev StrictMode, or the user already had a card), which is
  // fine to ignore rather than surface as an error the user can't act on.
  const completePendingJoin = useCallback(async () => {
    const pending = sessionStorage.getItem(PENDING_JOIN_STORAGE_KEY)
    if (!pending) return
    sessionStorage.removeItem(PENDING_JOIN_STORAGE_KEY)
    try {
      await api.post('/members/join', JSON.parse(pending))
    } catch {
      // Already joined, or malformed cached data — nothing actionable
      // for the user here; the dashboard will show their real state.
    }
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data?.success) {
        setUser(response.data.data.user)
        await completePendingJoin()
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [completePendingJoin])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await api.post('/auth/signup', { email, password, fullName })
    if (response.data?.success) {
      setUser(response.data.data.user)
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data?.success) {
      setUser(response.data.data.user)
    }
  }

  const signOut = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  const signInWithGoogle = async () => {
    throw new Error('OAuth sign-in is not implemented yet.')
  }

  const refreshProfile = async () => {
    await fetchCurrentUser()
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAdmin, profile: null,
      signUp, signIn, signOut, signInWithGoogle, refreshProfile,
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
