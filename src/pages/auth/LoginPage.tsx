import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { LoginSketchBackground } from '@/components/auth/LoginSketchBackground'
import { STAFF_ACCESS } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import { authErrorMessage, cn } from '@/utils'
import type { UserRole } from '@/types'

const BLEND =
  'linear-gradient(135deg, #84cc16 0%, #0d9488 35%, #2563eb 70%, #7c3aed 100%)'
const BLEND_SOFT =
  'radial-gradient(circle at 30% 40%, rgba(132,204,22,0.45) 0%, rgba(13,148,136,0.38) 35%, rgba(37,99,235,0.42) 65%, rgba(124,58,237,0.38) 100%)'
const BLEND_SOFT_ALT =
  'radial-gradient(circle at 70% 60%, rgba(124,58,237,0.42) 0%, rgba(37,99,235,0.38) 40%, rgba(13,148,136,0.34) 70%, rgba(132,204,22,0.3) 100%)'

export function LoginPage() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { login, loading, error, clearError, user, initialized } = useAuthStore()
  const adminAccess = STAFF_ACCESS[0]!
  const [email, setEmail] = useState<string>(adminAccess.email)
  const [password, setPassword] = useState<string>(adminAccess.password)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)
  const [activeRole, setActiveRole] = useState<UserRole | 'open' | null>(null)

  if (initialized && user) {
    return <Navigate to={profile?.role === 'cashier' ? '/pos' : '/dashboard'} replace />
  }

  function goAfterLogin(role?: string) {
    navigate(role === 'cashier' ? '/pos' : '/dashboard')
  }

  async function signInWith(nextEmail: string, nextPassword: string, tag: UserRole | 'open') {
    clearError()
    setEmail(nextEmail)
    setPassword(nextPassword)
    setActiveRole(tag)
    try {
      await login(nextEmail.trim(), nextPassword)
      goAfterLogin(useAuthStore.getState().profile?.role)
    } catch {
      /* stored */
    } finally {
      setActiveRole(null)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await signInWith(email, password, 'open')
  }

  return (
    <div className="relative flex h-dvh max-h-dvh items-center justify-center overflow-hidden bg-white px-3 py-3">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[-15%] h-[420px] w-[420px] rounded-full opacity-45 blur-[100px]"
        style={{ background: BLEND_SOFT }}
        animate={{ x: [0, 20, 0], y: [0, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-36 bottom-[-10%] h-[380px] w-[380px] rounded-full opacity-40 blur-[110px]"
        style={{ background: BLEND_SOFT_ALT }}
        animate={{ x: [0, -16, 0], y: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <LoginSketchBackground />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative z-10 w-full max-w-[380px]"
      >
        <div className="mb-3 text-center">
          <div className="relative mx-auto mb-2 flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 rounded-[18px]" style={{ background: BLEND }} />
            <BrandLogo className="relative h-12 w-12 rounded-[16px] shadow-inner" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[1.2rem] font-extrabold tracking-[-0.03em] text-[var(--bb-ink)]">
            Best Brightness
          </h1>
          <p className="mt-0.5 text-[12px] font-medium text-[var(--bb-muted)]">Smart POS · staff sign-in</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/92 p-4 shadow-[0_12px_36px_rgba(37,99,235,0.12)] backdrop-blur-xl"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: BLEND }} />

          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {STAFF_ACCESS.map((account) => (
              <button
                key={account.role}
                type="button"
                disabled={loading}
                onClick={() => void signInWith(account.email, account.password, account.role)}
                className={cn(
                  'rounded-xl px-1 py-2 text-center ring-1 transition',
                  activeRole === account.role
                    ? 'bb-blend-bg text-white ring-transparent'
                    : 'bg-[#f6f7fb] text-[var(--bb-ink)] ring-[var(--bb-border)] hover:ring-[var(--bb-blue)]/35',
                )}
              >
                <p className="text-[12px] font-extrabold">{account.label}</p>
                <p
                  className={cn(
                    'mt-0.5 text-[9px] font-semibold leading-tight',
                    activeRole === account.role ? 'text-white/85' : 'text-[var(--bb-muted)]',
                  )}
                >
                  {account.hint}
                </p>
              </button>
            ))}
          </div>

          <div className="mb-3 rounded-xl bg-[#f6f7fb] px-2.5 py-1.5">
            {STAFF_ACCESS.map((account) => (
              <p key={account.email} className="truncate text-[10px] font-semibold text-[var(--bb-muted)]">
                <span className="font-extrabold text-[var(--bb-ink)]">{account.label}</span>
                <span className="mx-1 opacity-40">·</span>
                {account.email}
                <span className="mx-1 opacity-40">·</span>
                {account.password}
              </p>
            ))}
          </div>

          <div className="space-y-2.5">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--bb-muted)]">Email</span>
              <div
                className={cn(
                  'flex items-center gap-2 rounded-xl bg-[#f6f7fb] px-3 ring-1',
                  emailFocus ? 'ring-[var(--bb-blue)]/50' : 'ring-[var(--bb-border)]',
                )}
              >
                <Mail className={cn('h-3.5 w-3.5', emailFocus ? 'text-[var(--bb-blue)]' : 'text-[var(--bb-muted)]')} />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  className="h-10 w-full border-0 bg-transparent text-[13px] font-medium outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--bb-muted)]">Password</span>
              <div
                className={cn(
                  'flex items-center gap-2 rounded-xl bg-[#f6f7fb] px-3 ring-1',
                  passwordFocus ? 'ring-[var(--bb-violet)]/45' : 'ring-[var(--bb-border)]',
                )}
              >
                <Lock
                  className={cn('h-3.5 w-3.5', passwordFocus ? 'text-[var(--bb-violet)]' : 'text-[var(--bb-muted)]')}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  className="h-10 w-full border-0 bg-transparent text-[13px] font-medium outline-none"
                />
              </div>
            </label>
          </div>

          {error ? (
            <p className="mt-2 rounded-xl bg-red-50 px-2.5 py-2 text-[11px] font-medium text-[var(--bb-danger)]">
              {authErrorMessage(error)}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-3 h-10 w-full !rounded-xl border-0 text-[14px] font-bold"
            loading={loading}
            style={{ background: BLEND, color: '#fff' }}
          >
            Sign in
          </Button>

          <div className="mt-2.5 text-center">
            <Link to="/forgot-password" className="text-[11px] font-semibold text-[var(--bb-muted)] hover:text-[var(--bb-blue)]">
              Forgot password?
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
