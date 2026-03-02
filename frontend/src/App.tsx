import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Demo from '@/pages/Demo'
import InvitePage from '@/pages/InvitePage'
import Login from '@/pages/Login'
import UserManagement from '@/pages/UserManagement'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Demo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
