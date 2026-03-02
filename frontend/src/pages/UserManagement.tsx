import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface ApiUser {
  id: string
  email: string | null
  role: string
}

export default function UserManagement() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetchUsers()
  }, [user])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const session = (await import('@/lib/supabase')).supabase.auth.getSession()
      const { data } = await session
      const accessToken = data.session?.access_token
      if (!accessToken) return
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const body = await res.json()
      if (res.ok) setUsers(body.users ?? [])
      else setError(body.detail ?? 'Failed to load users')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function createInvite() {
    setInviting(true)
    setError(null)
    setInviteLink(null)
    try {
      const session = (await import('@/lib/supabase')).supabase.auth.getSession()
      const { data } = await session
      const accessToken = data.session?.access_token
      if (!accessToken) return
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const body = await res.json()
      if (res.ok) setInviteLink(body.invite_link ?? '')
      else setError(body.detail ?? 'Failed to create invitation')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setInviting(false)
    }
  }

  async function setRole(userId: string, role: 'user' | 'admin') {
    setError(null)
    try {
      const session = (await import('@/lib/supabase')).supabase.auth.getSession()
      const { data } = await session
      const accessToken = data.session?.access_token
      if (!accessToken) return
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.detail ?? 'Failed to update role')
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  function copyLink() {
    if (inviteLink) navigator.clipboard.writeText(inviteLink)
  }

  if (authLoading || (!user || user.role !== 'admin')) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">User Management</h1>

      <div className="mb-6 flex flex-col gap-4">
        <Button onClick={createInvite} disabled={inviting}>
          {inviting ? 'Creating...' : 'Invite user'}
        </Button>
        {inviteLink && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <code className="flex-1 truncate text-sm">{inviteLink}</code>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Users</h2>
        {loading ? (
          <p className="text-slate-500">Loading users...</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-slate-700">{u.email ?? u.id}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>
                  {u.role !== 'admin' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRole(u.id, 'admin')}
                    >
                      Promote
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRole(u.id, 'user')}
                    >
                      Demote
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
