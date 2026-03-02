import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation link.')
      return
    }
    sessionStorage.setItem('invite_token', token)
  }, [token])

  useEffect(() => {
    if (!authLoading && user && token) {
      completeInvite()
    }
  }, [authLoading, user, token])

  async function completeInvite() {
    if (!user || !token) return
    setCompleting(true)
    setError(null)
    try {
      const session = (await import('@/lib/supabase')).supabase.auth.getSession()
      const { data } = await session
      const accessToken = data.session?.access_token
      if (!accessToken) {
        setError('Session expired. Please sign in again.')
        return
      }
      const res = await fetch(`${API_URL}/auth/complete-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ invite_token: token }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.detail ?? 'Failed to accept invitation')
        return
      }
      sessionStorage.removeItem('invite_token')
      await (await import('@/lib/supabase')).supabase.auth.refreshSession()
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setCompleting(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Go to login
        </Button>
      </main>
    )
  }

  if (authLoading || (user && completing)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">{user ? 'Accepting invitation...' : 'Loading...'}</p>
      </main>
    )
  }

  if (user && !completing && error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Go to app
        </Button>
      </main>
    )
  }

  if (user && !error && !completing) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Accept invitation</h1>
      <p className="text-center text-slate-600">
        Sign in with Google to accept this invitation and join the app.
      </p>
      <Button onClick={() => signInWithGoogle(window.location.href)}>Sign in with Google</Button>
    </main>
  )
}
