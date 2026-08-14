import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppModal } from '@/components/ui/AppModal'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { formatZar } from '@/utils'
import type { CartLineItem, PaymentMethod } from '@/types'

export interface CompletedSaleView {
  ref: string
  method: PaymentMethod
  items: CartLineItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  tendered?: number
  change?: number
}

interface SaleSuccessModalProps {
  sale: CompletedSaleView | null
  onClose: () => void
}

export function SaleSuccessModal({ sale, onClose }: SaleSuccessModalProps) {
  return (
    <AppModal open={Boolean(sale)} onClose={onClose} labelledBy="Purchase complete">
      {sale ? (
        <>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-[var(--bb-success)]" />
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.03em]">
              Great purchase
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-[var(--bb-muted)]">Sale recorded · {sale.ref}</p>
            <BrandLogo className="mt-2 h-9 w-9 rounded-xl" />
          </div>

          <div className="mt-3 max-h-32 space-y-1 overflow-y-auto">
            {sale.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 rounded-xl bg-[#f6f7fb] px-1.5 py-1">
                <ProductCartwheel src={item.imageUrl} path={item.imagePath} alt={item.name} size="sm" />
                <p className="min-w-0 flex-1 truncate text-[12px] font-bold">{item.name}</p>
                <p className="text-[11px] font-semibold text-[var(--bb-muted)]">×{item.quantity}</p>
                <p className="text-[12px] font-extrabold">{formatZar(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-[var(--bb-border)] pt-2 text-[12px]">
            <Row label="Subtotal" value={formatZar(sale.subtotal)} />
            {sale.discountAmount > 0 ? (
              <Row label="Discount" value={`- ${formatZar(sale.discountAmount)}`} />
            ) : null}
            <Row label="VAT 15%" value={formatZar(sale.taxAmount)} />
            <Row label="Total" value={formatZar(sale.total)} strong />
            <Row label="Paid by" value={sale.method.toUpperCase()} />
            {sale.method === 'cash' && sale.tendered != null ? (
              <>
                <Row label="Cash in" value={formatZar(sale.tendered)} />
                <Row label="Change" value={formatZar(sale.change ?? 0)} strong />
              </>
            ) : null}
          </div>

          <Button className="mt-4 w-full" size="sm" onClick={onClose}>
            New sale
          </Button>
        </>
      ) : null}
    </AppModal>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={strong ? 'font-bold' : 'font-medium text-[var(--bb-muted)]'}>{label}</span>
      <span className={strong ? 'font-extrabold bb-blend-text' : 'font-bold'}>{value}</span>
    </div>
  )
}
