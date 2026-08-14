import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, profile, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--bb-lime)] border-r-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
