import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { LoginSketchBackground } from '@/components/auth/LoginSketchBackground'
import { DEMO_ACCOUNTS } from '@/constants'
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
  const adminDemo = DEMO_ACCOUNTS[0]!
  const [email, setEmail] = useState<string>(adminDemo.email)
  const [password, setPassword] = useState<string>(adminDemo.password)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)
  const [demoRole, setDemoRole] = useState<UserRole | 'open' | null>(null)

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
    setDemoRole(tag)
    try {
      await login(nextEmail.trim(), nextPassword)
      goAfterLogin(useAuthStore.getState().profile?.role)
    } catch {
      /* stored */
    } finally {
      setDemoRole(null)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await signInWith(email, password, 'open')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      {/* Soft rich blend shadows on white */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[-15%] h-[560px] w-[560px] rounded-full opacity-50 blur-[100px]"
        style={{ background: BLEND_SOFT }}
        animate={{ x: [0, 28, 0], y: [0, 18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-36 bottom-[-10%] h-[520px] w-[520px] rounded-full opacity-45 blur-[110px]"
        style={{ background: BLEND_SOFT_ALT }}
        animate={{ x: [0, -22, 0], y: [0, -16, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Pencil product sketches — kitchen / cleaning / household */}
      <LoginSketchBackground />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="mb-5 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }}
            className="relative mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 rounded-[22px]"
              style={{ background: BLEND }}
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <BrandLogo className="relative h-[64px] w-[64px] rounded-[20px] shadow-inner" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-[14px] font-medium text-[var(--bb-muted)]"
          >
            Live shop demo — tap a role and walk the floor
          </motion.p>
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.18 }}
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_12px_40px_rgba(37,99,235,0.12),0_4px_16px_rgba(124,58,237,0.08)] backdrop-blur-xl"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-95"
            style={{ background: BLEND }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-35 blur-2xl"
            style={{ background: BLEND }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.28, 0.42, 0.28] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mb-4 rounded-2xl bg-[var(--bb-blend-soft)] px-3 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--bb-muted)]">
              <Sparkles className="h-3 w-3" />
              Portfolio demo
            </p>
            <p className="mt-1 text-[12px] font-medium leading-snug text-[var(--bb-ink)]">
              Open the till as Admin, Manager, or Cashier. Logins are public on purpose.
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  disabled={loading}
                  onClick={() => void signInWith(account.email, account.password, account.role)}
                  className={cn(
                    'rounded-xl px-1.5 py-2 text-center ring-1 transition',
                    demoRole === account.role
                      ? 'bb-blend-bg text-white ring-transparent'
                      : 'bg-white/90 text-[var(--bb-ink)] ring-[var(--bb-border)] hover:ring-[var(--bb-blue)]/40',
                  )}
                >
                  <p className="text-[12px] font-extrabold">{account.label}</p>
                  <p
                    className={cn(
                      'mt-0.5 text-[9px] font-semibold leading-tight',
                      demoRole === account.role ? 'text-white/80' : 'text-[var(--bb-muted)]',
                    )}
                  >
                    {account.hint}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-2 space-y-1 rounded-xl bg-white/70 px-2.5 py-2">
              {DEMO_ACCOUNTS.map((account) => (
                <p key={account.email} className="truncate text-[10px] font-semibold text-[var(--bb-muted)]">
                  <span className="font-extrabold text-[var(--bb-ink)]">{account.label}:</span>{' '}
                  {account.email}
                  <span className="mx-1 text-[var(--bb-border)]">·</span>
                  {account.password}
                </p>
              ))}
            </div>
          </div>

          <div className="relative space-y-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Email</span>
              <motion.div
                animate={{
                  boxShadow: emailFocus
                    ? '0 0 0 3px rgba(37,99,235,0.22), 0 0 0 1px rgba(124,58,237,0.55)'
                    : '0 0 0 1px #e6e8e3',
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 rounded-2xl bg-[#f6f7fb] px-3.5"
              >
                <Mail
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    emailFocus ? 'text-[#2563eb]' : 'text-[var(--bb-muted)]',
                  )}
                />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="you@bestbrightness.co.za"
                  className="h-11 w-full border-0 bg-transparent text-[14px] font-medium text-[var(--bb-ink)] outline-none placeholder:text-[var(--bb-muted)]/60"
                />
              </motion.div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Password</span>
              <motion.div
                animate={{
                  boxShadow: passwordFocus
                    ? '0 0 0 3px rgba(132,204,22,0.2), 0 0 0 1px rgba(37,99,235,0.5)'
                    : '0 0 0 1px #e6e8e3',
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 rounded-2xl bg-[#f6f7fb] px-3.5"
              >
                <Lock
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    passwordFocus ? 'text-[#7c3aed]' : 'text-[var(--bb-muted)]',
                  )}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder="••••••••"
                  className="h-11 w-full border-0 bg-transparent text-[14px] font-medium text-[var(--bb-ink)] outline-none placeholder:text-[var(--bb-muted)]/60"
                />
              </motion.div>
            </label>
          </div>

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-2xl bg-red-50 px-3 py-2.5 text-[12px] font-medium text-[var(--bb-danger)]"
            >
              {authErrorMessage(error)}
            </motion.p>
          ) : null}

          <motion.div className="mt-5" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="h-12 w-full !rounded-2xl border-0 text-[15px] font-bold shadow-[0_10px_28px_rgba(37,99,235,0.28)]"
              size="lg"
              loading={loading}
              style={{
                background: BLEND,
                color: '#ffffff',
              }}
            >
              Open the shop
            </Button>
          </motion.div>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-[12px] font-semibold text-[var(--bb-muted)] transition hover:text-[#2563eb]"
            >
              Forgot password?
            </Link>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-center text-[11px] font-medium text-[var(--bb-muted)]"
        >
          Portfolio demo · Best Brightness Smart POS
        </motion.p>
      </motion.div>
    </div>
  )
}
