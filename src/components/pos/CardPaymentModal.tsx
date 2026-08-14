import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, Lock, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppModal } from '@/components/ui/AppModal'
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  luhnCheck,
} from '@/utils/cardBrand'
import { formatZar } from '@/utils'

const VISA = 'https://i.ibb.co/JRx45S1d/43ed1d4685a1e776836cf19557cfca73-removebg-preview.png'
const MASTERCARD = 'https://i.ibb.co/mrsTMHB9/367c26d9ba9b9043c9bb4b5a17ab4d2f-removebg-preview.png'

interface CardPaymentModalProps {
  open: boolean
  amount: number
  onClose: () => void
  onApproved: (reference: string) => void
}

function cardGradient(brand: string): string {
  if (brand === 'visa') return 'linear-gradient(135deg, #e0f2fe 0%, #b8d9f0 60%, #7dd3fc 100%)'
  if (brand === 'mastercard') return 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)'
  if (brand === 'amex') return 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)'
  return 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)'
}

export function CardPaymentModal({ open, amount, onClose, onApproved }: CardPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber])
  const digits = cardNumber.replace(/\s+/g, '')
  const darkText = brand === 'visa'
  const valid =
    luhnCheck(digits) &&
    /^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry) &&
    ((brand === 'amex' && cvc.length === 4) || (brand !== 'amex' && cvc.length === 3)) &&
    cardName.trim().length > 1

  const busy = status === 'processing' || status === 'success'

  function reset() {
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setCardName('')
    setFlipped(false)
    setError('')
    setStatus('idle')
  }

  function handleClose() {
    if (busy) return
    reset()
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) {
      setError('Check the card number, expiry, and CVV.')
      return
    }
    const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
    if (match) {
      const lastDay = new Date(2000 + Number(match[2]), Number(match[1]), 0)
      if (lastDay < new Date()) {
        setError('Card has expired.')
        return
      }
    }
    setError('')
    setStatus('processing')
    await new Promise((r) => setTimeout(r, 1800))
    const ref = `STRIPE-${Date.now().toString().slice(-8)}`
    setStatus('success')
    await new Promise((r) => setTimeout(r, 900))
    onApproved(ref)
    reset()
  }

  const field =
    'mt-1 h-9 w-full rounded-xl border border-[var(--bb-border)] bg-[#f6f7fb] px-3 text-[13px] font-semibold outline-none focus:border-[var(--bb-blue)] focus:bg-white'

  return (
    <AppModal open={open} onClose={handleClose} labelledBy="Card payment">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] bb-blend-text">Stripe · Card</p>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-extrabold">{formatZar(amount)}</h2>
        </div>
        {status === 'idle' ? (
          <button type="button" onClick={handleClose} className="text-[var(--bb-muted)]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {status === 'idle' ? (
        <>
          <div className="mb-3 flex justify-center" style={{ perspective: 900 }}>
            <div
              className="relative h-[140px] w-[236px] transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                className="absolute inset-0 rounded-xl p-3 shadow-md"
                style={{ background: cardGradient(brand), backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-start justify-between">
                  <div className="h-6 w-8 rounded bg-gradient-to-br from-yellow-300/50 to-yellow-600/40" />
                  {brand === 'visa' ? <img src={VISA} alt="Visa" className="h-5 object-contain" /> : null}
                  {brand === 'mastercard' ? (
                    <img src={MASTERCARD} alt="Mastercard" className="h-6 object-contain" />
                  ) : null}
                </div>
                <p className={`mt-6 font-mono text-[13px] tracking-[0.12em] ${darkText ? 'text-slate-800' : 'text-white'}`}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div className="mt-3 flex justify-between">
                  <div>
                    <p className={`text-[7px] uppercase ${darkText ? 'text-slate-600' : 'text-white/70'}`}>Cardholder</p>
                    <p className={`text-[10px] font-bold uppercase ${darkText ? 'text-slate-900' : 'text-white'}`}>
                      {cardName || 'YOUR NAME'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[7px] uppercase ${darkText ? 'text-slate-600' : 'text-white/70'}`}>Expires</p>
                    <p className={`text-[10px] font-bold ${darkText ? 'text-slate-900' : 'text-white'}`}>
                      {expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: cardGradient(brand),
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="mt-4 h-8 bg-black/55" />
                <div className="mx-3 mt-5 rounded-md bg-white px-2.5 py-1.5 text-right font-mono text-sm text-slate-800">
                  {cvc || '•••'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
            <label className="block text-[11px] font-semibold text-[var(--bb-muted)]">
              Name on card
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                onFocus={() => setFlipped(false)}
                placeholder="JANE SMITH"
                className={field}
              />
            </label>
            <label className="block text-[11px] font-semibold text-[var(--bb-muted)]">
              Card number
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value, brand))}
                onFocus={() => setFlipped(false)}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                className={`${field} font-mono`}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-semibold text-[var(--bb-muted)]">
                Expiry
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  onFocus={() => setFlipped(false)}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-semibold text-[var(--bb-muted)]">
                CVV
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3))}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setTimeout(() => setFlipped(false), 250)}
                  placeholder={brand === 'amex' ? '1234' : '123'}
                  inputMode="numeric"
                  className={`${field} font-mono`}
                />
              </label>
            </div>
            {error ? <p className="text-[11px] font-semibold text-[var(--bb-danger)]">{error}</p> : null}
            <Button type="submit" className="mt-1 w-full" size="sm" disabled={!valid}>
              <Lock className="h-3.5 w-3.5" />
              Pay {formatZar(amount)}
            </Button>
          </form>
        </>
      ) : null}

      {status === 'processing' ? (
        <div className="py-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--bb-border)] border-t-[var(--bb-blue)]" />
          <p className="mt-3 text-[14px] font-bold">Processing with Stripe…</p>
          <p className="mt-0.5 text-[12px] text-[var(--bb-muted)]">Do not remove the card.</p>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="py-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--bb-success)]" />
          <p className="mt-3 text-[14px] font-bold">Payment approved</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="py-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-[var(--bb-danger)]" />
          <p className="mt-3 text-[14px] font-bold">Payment failed</p>
          <Button className="mt-3" size="sm" onClick={() => setStatus('idle')}>
            Try again
          </Button>
        </div>
      ) : null}
    </AppModal>
  )
}
