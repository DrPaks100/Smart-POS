import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Nfc,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatZar } from '@/utils'
import type { SpeedpointPhase } from '@/types'

interface SpeedpointTerminalProps {
  amount: number
  open: boolean
  onClose: () => void
  onApproved: (reference: string) => void
}

const PHASE_COPY: Record<SpeedpointPhase, string> = {
  idle: 'Ready',
  waiting_card: 'Present card / tap / insert',
  reading: 'Reading card…',
  authorizing: 'Authorizing…',
  approved: 'Payment approved',
  declined: 'Payment declined',
  cancelled: 'Cancelled',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function SpeedpointTerminal({
  amount,
  open,
  onClose,
  onApproved,
}: SpeedpointTerminalProps) {
  const [phase, setPhase] = useState<SpeedpointPhase>('idle')
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (!open) {
      setPhase('idle')
      setReference('')
    }
  }, [open])

  async function runSimulation(outcome: 'approved' | 'declined') {
    setPhase('waiting_card')
    await sleep(800)
    setPhase('reading')
    await sleep(900)
    setPhase('authorizing')
    await sleep(1100)

    if (outcome === 'approved') {
      const ref = `SP-${Date.now().toString().slice(-8)}`
      setReference(ref)
      setPhase('approved')
      await sleep(500)
      onApproved(ref)
      return
    }

    setPhase('declined')
  }

  const busy = phase === 'reading' || phase === 'authorizing'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bb-ink)]/35 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass-strong w-full max-w-[380px] overflow-hidden rounded-[var(--radius-card)]"
          >
            <div
              className="h-1 w-full"
              style={{ background: 'var(--bb-blend)' }}
            />
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] bb-blend-text">
                  Speedpoint
                </p>
                <h3 className="text-[15px] font-bold text-[var(--bb-ink)]">Card terminal</h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f7fb]">
                <ShieldCheck className="h-4 w-4 text-[var(--bb-blue)]" />
              </div>
            </div>

            <div className="space-y-4 px-4 pb-4">
              <div className="rounded-2xl bg-[#f6f7fb] px-3 py-4 text-center">
                <p className="text-[11px] font-semibold text-[var(--bb-muted)]">Amount due</p>
                <p className="mt-0.5 font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold bb-blend-text">
                  {formatZar(amount)}
                </p>
              </div>

              <div className="flex h-28 flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--bb-border)] bg-white">
                {phase === 'approved' ? (
                  <CheckCircle2 className="h-8 w-8 text-[var(--bb-success)]" />
                ) : phase === 'declined' ? (
                  <XCircle className="h-8 w-8 text-[var(--bb-danger)]" />
                ) : phase === 'authorizing' || phase === 'reading' ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--bb-blue)]" />
                ) : (
                  <div className="flex items-center gap-2 text-[var(--bb-ink)]">
                    <CreditCard className="h-6 w-6" />
                    <Nfc className="h-5 w-5 text-[var(--bb-violet)]" />
                  </div>
                )}
                <p className="mt-2 text-[12px] font-semibold text-[var(--bb-muted)]">
                  {PHASE_COPY[phase]}
                </p>
                {reference ? (
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--bb-muted)]">
                    REF {reference}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full" disabled={busy} onClick={() => void runSimulation('approved')}>
                  Simulate tap
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={busy}
                  onClick={() => void runSimulation('declined')}
                >
                  Decline
                </Button>
              </div>

              <Button variant="ghost" className="w-full" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
