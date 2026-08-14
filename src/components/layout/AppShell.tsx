import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Boxes,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { NAV_ITEMS, ROLE_LABELS } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'
import type { UserRole } from '@/types'

const ICONS = {
  '/dashboard': LayoutDashboard,
  '/pos': ShoppingCart,
  '/products': Package,
  '/inventory': Boxes,
  '/customers': Users,
  '/suppliers': Truck,
  '/reports': ChartColumn,
  '/staff': UserCog,
  '/settings': Settings,
} as const

export function AppShell() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const role = (profile?.role ?? 'cashier') as UserRole

  const items = NAV_ITEMS.filter((item) =>
    (item.roles as readonly UserRole[]).includes(role),
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const nav = (
    <>
      <div className="mb-3 flex items-center gap-2 px-1 py-1">
        <BrandLogo className="h-11 w-11 shrink-0 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.16)]" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--bb-muted)]">
            Best Brightness
          </p>
          <p className="font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.02em] text-[var(--bb-ink)]">
            Smart POS
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = ICONS[item.to as keyof typeof ICONS]
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * index, duration: 0.2 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-[13px] font-semibold transition-all',
                    isActive
                      ? 'bb-blend-bg text-white shadow-[0_6px_18px_rgba(37,99,235,0.28)]'
                      : 'text-[var(--bb-muted)] hover:bg-white/70 hover:text-[var(--bb-ink)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-white' : 'text-[var(--bb-muted)]',
                      )}
                      strokeWidth={2.1}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="mt-2 space-y-1.5 border-t border-[var(--bb-border)] pt-2">
        <div className="rounded-2xl bg-white/70 px-2.5 py-2 ring-1 ring-[var(--bb-border)]">
          <p className="truncate text-[12px] font-bold text-[var(--bb-ink)]">
            {profile?.displayName ?? 'User'}
          </p>
          <p className="text-[11px] font-medium text-[var(--bb-muted)]">
            {profile ? ROLE_LABELS[profile.role] : '—'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </>
  )

  return (
    <div className="relative min-h-screen bg-[var(--bb-bg)]">
      <div className="bb-ambient" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="glass sticky top-0 z-[1] hidden h-screen w-[188px] shrink-0 flex-col self-start border-r border-[var(--bb-border)] px-2 py-3 lg:flex">
          {nav}
        </aside>

        <main className="relative z-10 min-w-0 flex-1 overflow-x-hidden pb-16 lg:pb-0">
          <header className="glass sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-[var(--bb-border)] px-3 py-2.5 lg:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-display)] text-[14px] font-extrabold text-[var(--bb-ink)]">
                  Smart POS
                </p>
                <p className="truncate text-[10px] font-semibold text-[var(--bb-muted)]">
                  {profile ? ROLE_LABELS[profile.role] : '—'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 w-9 shrink-0 p-0"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </header>

          <div className="px-3 py-3 md:px-4 md:py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[120] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="glass absolute inset-y-0 left-0 flex w-[min(88vw,280px)] flex-col px-2 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.25)]"
            >
              {nav}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
