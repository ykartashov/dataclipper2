import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '@/lib/supabase'

type AppRole = 'user' | 'admin' | null

interface User {
  id: string
  email: string | null
  role: AppRole
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getRoleFromToken(accessToken: string): AppRole {
  try {
    const payload = jwtDecode<{ user_role?: string }>(accessToken)
    const r = payload.user_role
    if (r === 'admin' || r === 'user') return r
  } catch {
    // ignore
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const updateFromSession = useCallback(async (accessToken: string | undefined) => {
    if (!accessToken) {
      setUser(null)
      return
    }
    const role = getRoleFromToken(accessToken)
    try {
      const payload = jwtDecode<{ sub: string; email?: string }>(accessToken)
      setUser({
        id: payload.sub,
        email: payload.email ?? null,
        role,
      })
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateFromSession(session?.access_token)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { access_token: string } | null) => {
      updateFromSession(session?.access_token)
    })

    return () => subscription.unsubscribe()
  }, [updateFromSession])

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo ?? window.location.origin },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading, signInWithGoogle, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
