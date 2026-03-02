import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function Demo() {
  const { user, signOut } = useAuth()
  const [randomNumber, setRandomNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomNumber = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/random`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data: { number: number } = await res.json()
      setRandomNumber(data.number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400">Role: {user?.role ?? '—'}</p>
        </div>
        <nav className="flex gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Demo
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/users"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              User Management
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </nav>
      </header>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-semibold">Random Number Demo</h1>
        <p className="mb-6 text-slate-600">
          Frontend uses React + shadcn/ui-style button, backend uses FastAPI.
        </p>

        <div className="mb-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Current random number
          </p>
          <p className="mt-2 text-5xl font-bold text-slate-900">
            {randomNumber ?? '--'}
          </p>
        </div>

        <Button onClick={fetchRandomNumber} disabled={loading}>
          {loading ? 'Loading...' : 'Generate Random Number'}
        </Button>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            Failed to fetch: {error}
          </p>
        )}
      </div>
    </main>
  )
}
