import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { authErrorMessage } from '@/utils'

export function ForgotPasswordPage() {
  const { sendReset, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await sendReset(email.trim())
      setSent(true)
    } catch {
      /* handled */
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bb-bg)] px-4">
      <div className="bb-ambient" aria-hidden />
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative z-10 w-full max-w-[380px] overflow-hidden rounded-[var(--radius-card)] p-5"
      >
        <div className="absolute inset-x-0 top-0 h-1 bb-blend-bg" aria-hidden />
        <BrandLogo className="mb-3 h-14 w-14 rounded-xl" />
        <h1 className="font-[family-name:var(--font-display)] text-[1.4rem] font-extrabold tracking-[-0.03em] text-[var(--bb-ink)]">
          Reset password
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[var(--bb-muted)]">
          We&apos;ll email you a secure reset link.
        </p>

        {sent ? (
          <p className="mt-4 rounded-2xl bg-[var(--bb-blend-soft)] px-3 py-2.5 text-[13px] font-medium text-[var(--bb-ink)]">
            Check your inbox for the reset link.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error ? (
              <p className="text-[12px] font-medium text-[var(--bb-danger)]">
                {authErrorMessage(error)}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Send link
            </Button>
          </div>
        )}

        <Link
          to="/login"
          className="mt-4 inline-block text-[12px] font-semibold text-[var(--bb-muted)] hover:text-[var(--bb-blue)]"
        >
          Back to sign in
        </Link>
      </motion.form>
    </div>
  )
}
