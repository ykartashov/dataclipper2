import { useState } from 'react'
import { Button } from '@/components/ui/button'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function Demo() {
  const [randomNumber, setRandomNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomNumber = async () => {
    setLoading(true)
    setError(null)
    try {
      const session = (await import('@/lib/supabase')).supabase.auth.getSession()
      const { data: sessionData } = await session
      const accessToken = sessionData.session?.access_token
      if (!accessToken) throw new Error('Missing auth session')

      const res = await fetch(`${API_URL}/random`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const payload: { number: number } = await res.json()
      setRandomNumber(payload.number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-semibold">Random Number Demo</h1>
        <p className="mb-6 text-muted-foreground">
          Frontend uses React + shadcn/ui-style button, backend uses FastAPI.
        </p>

        <div className="mb-6 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Current random number
          </p>
          <p className="mt-2 text-5xl font-bold">
            {randomNumber ?? '--'}
          </p>
        </div>

        <Button onClick={fetchRandomNumber} disabled={loading}>
          {loading ? 'Loading...' : 'Generate Random Number'}
        </Button>

        {error && (
          <p className="mt-4 text-sm text-destructive">
            Failed to fetch: {error}
          </p>
        )}
      </div>
    </div>
  )
}
