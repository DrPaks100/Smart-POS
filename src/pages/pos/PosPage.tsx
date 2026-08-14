import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Banknote,
  Camera,
  CreditCard,
  IdCard,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SimpleBarcodeScanner } from '@/components/pos/SimpleBarcodeScanner'
import { CashPaymentModal } from '@/components/pos/CashPaymentModal'
import { CardPaymentModal } from '@/components/pos/CardPaymentModal'
import { SaleSuccessModal, type CompletedSaleView } from '@/components/pos/SaleSuccessModal'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { STORE_ID } from '@/constants'
import { findCustomerByCard } from '@/services/customerService'
import { findProductByBarcode, listProducts } from '@/services/productService'
import { getStoreSettings } from '@/services/settingsService'
import { completeSale } from '@/services/saleService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { cn, formatZar } from '@/utils'
import type { Product } from '@/types'

const FALLBACK_CLUB_PERCENT = 5

function toCartLine(product: Product) {
  return {
    productId: product.id,
    name: product.name,
    barcode: product.barcode,
    unitPrice: product.sellingPrice,
    costPrice: product.costPrice,
    imageUrl: product.imageUrl,
    imagePath: product.imagePath,
  }
}

export function PosPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const {
    items,
    addOrIncrement,
    setQuantity,
    removeItem,
    clear,
    paymentMethod,
    setPaymentMethod,
    discountPercent,
    setDiscountPercent,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  } = useCartStore()

  const [query, setQuery] = useState('')
  const [cashTendered, setCashTendered] = useState('')
  const [payOpen, setPayOpen] = useState<'cash' | 'card' | null>(null)
  const [receipt, setReceipt] = useState<CompletedSaleView | null>(null)
  const [lastRef, setLastRef] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'product' | 'member' | null>(null)
  const [memberCard, setMemberCard] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  const { data: products = [] } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
  })

  const { data: settings } = useQuery({
    queryKey: ['settings', storeId],
    queryFn: () => getStoreSettings(storeId),
  })

  const clubPercent = settings?.clubDiscountPercent ?? FALLBACK_CLUB_PERCENT

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products],
  )

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return activeProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8)
  }, [activeProducts, query])

  function addProduct(product: Product) {
    addOrIncrement(toCartLine(product))
    setQuery('')
    toast.success(product.name)
  }

  async function tryAddByBarcode(raw: string) {
    const code = raw.trim()
    if (!code) return false
    setScanning(true)
    try {
      const needle = code.toLowerCase()
      const local = activeProducts.find(
        (p) => p.barcode.trim().toLowerCase() === needle,
      )
      const product = local ?? (await findProductByBarcode(code, storeId))
      if (!product) {
        toast.error(`No product for barcode "${code}"`)
        return false
      }
      addProduct(product)
      return true
    } finally {
      setScanning(false)
    }
  }

  async function applyMemberCard(code: string) {
    const card = code.trim()
    if (!card) return
    try {
      const customer = await findCustomerByCard(card, storeId)
      setMemberCard(card)
      setDiscountPercent(clubPercent)
      if (customer) {
        toast.success(`${customer.name} · Bright Club ${clubPercent}%`)
      } else {
        toast.success(`Bright Club · ${clubPercent}% saving`)
      }
    } catch {
      setMemberCard(card)
      setDiscountPercent(clubPercent)
      toast.success(`Bright Club · ${clubPercent}% saving`)
    }
  }

  function handleSearchChange(value: string) {
    setQuery(value)
    const exact = activeProducts.find(
      (p) => p.barcode.trim().toLowerCase() === value.trim().toLowerCase(),
    )
    if (exact) addProduct(exact)
  }

  function handleBarcodeScanned(barcode: string) {
    const mode = scanMode
    setScanMode(null)
    toast.message(`Scanned ${barcode}`)
    if (mode === 'member') void applyMemberCard(barcode)
    else void tryAddByBarcode(barcode)
  }

  async function recordSale(paymentRef: string) {
    if (items.length === 0 || completing) return false
    const snapshot: CompletedSaleView = {
      ref: paymentRef,
      method: paymentMethod,
      items: items.map((item) => ({ ...item })),
      subtotal: subtotal(),
      taxAmount: taxAmount(),
      discountAmount: discountAmount(),
      total: total(),
      tendered: paymentMethod === 'cash' ? Number(cashTendered) || total() : undefined,
      change:
        paymentMethod === 'cash'
          ? Math.max(0, (Number(cashTendered) || total()) - total())
          : undefined,
    }
    setCompleting(true)
    try {
      await completeSale({
        storeId,
        items,
        subtotal: snapshot.subtotal,
        discountPercent,
        discountAmount: snapshot.discountAmount,
        taxAmount: snapshot.taxAmount,
        total: snapshot.total,
        paymentMethod,
        paymentRef,
        memberCard,
        cashierId: profile?.uid ?? '',
        cashierName: profile?.displayName ?? 'Cashier',
        amountTendered: snapshot.tendered ?? snapshot.total,
        changeGiven: snapshot.change ?? 0,
      })
      setLastRef(paymentRef)
      setCashTendered('')
      setMemberCard(null)
      setPayOpen(null)
      clear()
      setReceipt(snapshot)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      return true
    } catch (err) {
      const message = (err as Error).message
      toast.error(
        message.includes('permission')
          ? 'Could not record the sale. Publish Firestore rules, then try again.'
          : message || 'Could not record the sale.',
      )
      return false
    } finally {
      setCompleting(false)
    }
  }

  function startPayment() {
    if (items.length === 0 || completing) return
    if (paymentMethod === 'cash') {
      setPayOpen('cash')
      return
    }
    if (paymentMethod === 'card') {
      setPayOpen('card')
      return
    }
    void recordSale(`EFT-${Date.now().toString().slice(-6)}`)
  }

  return (
    <div className="flex min-h-0 flex-col gap-2 lg:h-[calc(100vh-5.5rem)]">
      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="flex min-h-0 min-w-0 flex-col gap-2">
          <div className="relative">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h1 className="font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.03em] text-[var(--bb-ink)]">
                POS
              </h1>
              {lastRef ? (
                <span className="rounded-full bg-[var(--bb-blend-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--bb-blue)]">
                  Last · {lastRef}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={query}
                disabled={scanning || completing}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (searchHits.length === 1) {
                    addProduct(searchHits[0]!)
                    return
                  }
                  void tryAddByBarcode(query)
                }}
                placeholder="Scan barcode or search by name…"
                className="glass h-9 min-w-0 flex-1 rounded-xl border-0 px-3 text-[13px] font-medium outline-none ring-1 ring-[var(--bb-border)] focus:ring-2 focus:ring-[var(--bb-blue)]/30"
              />
              <Button type="button" size="sm" className="h-9 shrink-0" onClick={() => setScanMode('product')}>
                <Camera className="h-3.5 w-3.5" />
                Scan
              </Button>
              <Button
                type="button"
                size="sm"
                variant={memberCard ? 'primary' : 'secondary'}
                className="h-9 shrink-0"
                onClick={() => setScanMode('member')}
              >
                <IdCard className="h-3.5 w-3.5" />
                Club
              </Button>
            </div>

            {searchHits.length > 0 ? (
              <div className="glass-strong absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-2xl p-1.5">
                {searchHits.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 text-left hover:bg-[#f6f7fb]"
                  >
                    <ProductCartwheel src={product.imageUrl} path={product.imagePath} alt={product.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[var(--bb-ink)]">{product.name}</p>
                      <p className="truncate font-mono text-[10px] text-[var(--bb-muted)]">{product.barcode}</p>
                    </div>
                    <p className="shrink-0 text-[12px] font-extrabold text-[var(--bb-blue)]">
                      {formatZar(product.sellingPrice)}
                    </p>
                  </button>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <p className="mt-1 text-[11px] font-medium text-[var(--bb-muted)]">No match — try the name or scan.</p>
            ) : null}
          </div>

          {memberCard ? (
            <div className="flex items-center justify-between rounded-xl bg-[var(--bb-blend-soft)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--bb-ink)]">
              <span>Bright Club · {memberCard} · {clubPercent}% off</span>
              <button
                type="button"
                className="text-[var(--bb-muted)] hover:text-[var(--bb-danger)]"
                onClick={() => {
                  setMemberCard(null)
                  setDiscountPercent(0)
                }}
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="glass-strong flex min-h-0 flex-1 flex-col rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-[var(--bb-ink)]">Cart</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[12px]"
                onClick={() => {
                  clear()
                  setMemberCard(null)
                }}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
              {items.length === 0 ? (
                <p className="rounded-xl bg-[#f6f7fb] px-3 py-10 text-center text-[12px] font-medium text-[var(--bb-muted)]">
                  Scan an item, or search by name and tap it into the cart.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 rounded-xl bg-[#f6f7fb] p-1.5"
                  >
                    <ProductCartwheel src={item.imageUrl} path={item.imagePath} alt={item.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[var(--bb-ink)]">{item.name}</p>
                      <p className="text-[10px] text-[var(--bb-muted)]">{formatZar(item.unitPrice)}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                      className="h-7 w-10 rounded-lg border border-[var(--bb-border)] bg-white px-1 text-center text-[11px] font-bold"
                    />
                    <p className="w-16 shrink-0 text-right text-[12px] font-extrabold text-[var(--bb-ink)]">
                      {formatZar(item.lineTotal)}
                    </p>
                    <button
                      type="button"
                      className="pr-1 text-[var(--bb-muted)] hover:text-[var(--bb-danger)]"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="glass-strong flex min-h-0 flex-col rounded-2xl p-3">
          <h2 className="mb-2 text-[13px] font-bold text-[var(--bb-ink)]">Pay</h2>

          <div className="space-y-1 text-[12px]">
            <Row label="Subtotal" value={formatZar(subtotal())} />
            <Row
              label={memberCard ? `Club ${clubPercent}%` : 'Discount'}
              value={`- ${formatZar(discountAmount())}`}
            />
            <Row label="VAT 15%" value={formatZar(taxAmount())} />
            <Row label="Total" value={formatZar(total())} strong />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'eft', label: 'EFT', icon: Wallet },
              ] as const
            ).map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  'rounded-xl px-1.5 py-1.5 text-[10px] font-bold transition',
                  paymentMethod === method.id
                    ? 'bb-blend-bg text-white'
                    : 'bg-[#f6f7fb] text-[var(--bb-muted)] hover:text-[var(--bb-ink)]',
                )}
              >
                <method.icon className="mx-auto mb-0.5 h-3.5 w-3.5" />
                {method.label}
              </button>
            ))}
          </div>

          <Button
            className="mt-5 w-full"
            size="sm"
            disabled={items.length === 0}
            loading={completing}
            onClick={startPayment}
          >
            {paymentMethod === 'card' ? 'Card payment' : paymentMethod === 'cash' ? 'Cash payment' : 'Complete EFT'}
          </Button>
        </aside>
      </div>

      <CashPaymentModal
        open={payOpen === 'cash'}
        amount={total()}
        tendered={cashTendered}
        onTenderedChange={setCashTendered}
        loading={completing}
        onClose={() => setPayOpen(null)}
        onConfirm={() => void recordSale(`CASH-${Date.now().toString().slice(-6)}`)}
      />

      <CardPaymentModal
        open={payOpen === 'card'}
        amount={total()}
        onClose={() => setPayOpen(null)}
        onApproved={(ref) => void recordSale(ref)}
      />

      <SaleSuccessModal sale={receipt} onClose={() => setReceipt(null)} />

      {scanMode ? (
        <SimpleBarcodeScanner
          onBarcodeScanned={handleBarcodeScanned}
          onClose={() => setScanMode(null)}
        />
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'font-bold text-[var(--bb-ink)]' : 'font-medium text-[var(--bb-muted)]'}>
        {label}
      </span>
      <span
        className={
          strong
            ? 'font-[family-name:var(--font-display)] text-[1rem] font-extrabold bb-blend-text'
            : 'font-bold text-[var(--bb-ink)]'
        }
      >
        {value}
      </span>
    </div>
  )
}
