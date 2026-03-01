import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [randomNumber, setRandomNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
    [],
  )

  const fetchRandomNumber = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/random`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data: { number: number } = await response.json()
      setRandomNumber(data.number)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unknown error while loading number'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
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
            Failed to fetch from `{apiBaseUrl}/random`: {error}
          </p>
        )}
      </div>
    </main>
  )
}

export default App
