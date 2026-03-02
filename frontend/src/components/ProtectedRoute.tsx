import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.role) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-slate-600">
          You need an invitation to access the app. Contact an admin.
        </p>
        <button
          type="button"
          className="text-sm text-slate-500 underline hover:text-slate-700"
          onClick={() => import('@/lib/supabase').then((m) => m.supabase.auth.signOut())}
        >
          Sign out
        </button>
      </main>
    )
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
