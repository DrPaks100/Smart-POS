import { Banknote, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AppModal } from '@/components/ui/AppModal'
import { formatZar } from '@/utils'

const QUICK = [50, 100, 200, 500]

interface CashPaymentModalProps {
  open: boolean
  amount: number
  tendered: string
  onTenderedChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function CashPaymentModal({
  open,
  amount,
  tendered,
  onTenderedChange,
  onClose,
  onConfirm,
  loading,
}: CashPaymentModalProps) {
  const given = Number(tendered) || 0
  const change = Math.max(0, given - amount)
  const short = given > 0 && given < amount

  return (
    <AppModal open={open} onClose={loading ? undefined : onClose} labelledBy="Cash payment">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bb-blend-bg">
            <Banknote className="h-4 w-4" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.03em]">
            Cash payment
          </h2>
        </div>
        <button type="button" onClick={onClose} disabled={loading} className="text-[var(--bb-muted)]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl bg-[#f6f7fb] px-3 py-3 text-center">
        <p className="text-[11px] font-semibold text-[var(--bb-muted)]">Amount due</p>
        <p className="font-[family-name:var(--font-display)] text-[1.55rem] font-extrabold bb-blend-text">
          {formatZar(amount)}
        </p>
      </div>

      <div className="mt-3">
        <Input
          label="Cash in (R)"
          type="number"
          min={0}
          step="0.01"
          value={tendered}
          onChange={(e) => onTenderedChange(e.target.value)}
          placeholder="0.00"
          autoFocus
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onTenderedChange(amount.toFixed(2))}
          className="rounded-lg bg-[#f6f7fb] px-2.5 py-1 text-[11px] font-bold text-[var(--bb-ink)] ring-1 ring-[var(--bb-border)]"
        >
          Exact
        </button>
        {QUICK.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onTenderedChange(String(n))}
            className="rounded-lg bg-[#f6f7fb] px-2.5 py-1 text-[11px] font-bold text-[var(--bb-ink)] ring-1 ring-[var(--bb-border)]"
          >
            {formatZar(n)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--bb-blend-soft)] px-3 py-2.5">
        <span className="text-[13px] font-bold text-[var(--bb-ink)]">Change</span>
        <span className="font-[family-name:var(--font-display)] text-[1.05rem] font-extrabold bb-blend-text">
          {formatZar(change)}
        </span>
      </div>
      {short ? (
        <p className="mt-1.5 text-[11px] font-semibold text-[var(--bb-danger)]">Cash in is less than the total.</p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button className="flex-1" size="sm" loading={loading} disabled={given < amount} onClick={onConfirm}>
          Process payment
        </Button>
      </div>
    </AppModal>
  )
}
