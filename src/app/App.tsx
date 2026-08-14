import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PosPage } from '@/pages/pos/PosPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { SuppliersPage } from '@/features/suppliers/SuppliersPage'
import { SalesHistoryPage } from '@/features/sales/SalesHistoryPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { StaffPage } from '@/features/staff/StaffPage'
import { useAuthStore } from '@/stores/authStore'
import { applyTheme, useThemeStore } from '@/stores/themeStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  const init = useAuthStore((s) => s.init)
  const themeId = useThemeStore((s) => s.themeId)

  useEffect(() => {
    const unsub = init()
    return unsub
  }, [init])

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/reports" element={<SalesHistoryPage />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme={themeId === 'dark' ? 'dark' : 'light'}
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bb-surface)',
            border: '1px solid var(--bb-border)',
            color: 'var(--bb-ink)',
            boxShadow: 'var(--bb-shadow-lg)',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
