import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user?.role) navigate('/', { replace: true })
  }, [user, loading, navigate])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </main>
    )
  }

  if (user && !user.role) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <p className="text-center text-slate-600">
          You need an invitation to access the app. Contact an admin.
        </p>
        <Button variant="outline" onClick={() => import('@/lib/supabase').then((m) => m.supabase.auth.signOut())}>
          Sign out
        </Button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Sign in to continue</h1>
      <Button onClick={() => signInWithGoogle()}>Sign in with Google</Button>
    </main>
  )
}
