import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Package, PackageMinus, PackagePlus, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppModal } from '@/components/ui/AppModal'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { STORE_ID } from '@/constants'
import { adjustStock, listInventoryLogs } from '@/services/inventoryService'
import { listProducts } from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatZar } from '@/utils'
import type { InventoryAdjustType, Product } from '@/types'

type StockFilter = 'all' | 'low' | 'out'

export function InventoryPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StockFilter>('all')
  const [selected, setSelected] = useState<Product | null>(null)
  const [adjustType, setAdjustType] = useState<InventoryAdjustType>('receive')
  const [amount, setAmount] = useState('1')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['inventory-logs', storeId],
    queryFn: () => listInventoryLogs(storeId, 30),
  })

  const lowCount = products.filter((p) => p.isActive && p.stockQuantity <= p.lowStockThreshold).length
  const outCount = products.filter((p) => p.isActive && p.stockQuantity <= 0).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (!p.isActive) return false
      if (filter === 'low' && p.stockQuantity > p.lowStockThreshold) return false
      if (filter === 'out' && p.stockQuantity > 0) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q)
      )
    })
  }, [products, query, filter])

  function openAdjust(product: Product, type: InventoryAdjustType = 'receive') {
    setSelected(product)
    setAdjustType(type)
    setAmount(type === 'set' ? String(product.stockQuantity) : '1')
    setReason('')
  }

  async function submitAdjust() {
    if (!selected || !profile) return
    const qty = Number(amount)
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error('Enter a valid quantity.')
      return
    }
    setSaving(true)
    try {
      const result = await adjustStock({
        productId: selected.id,
        type: adjustType,
        amount: qty,
        reason: reason || (adjustType === 'receive' ? 'Stock received' : adjustType === 'remove' ? 'Stock removed' : 'Stock counted'),
        storeId,
        userId: profile.uid,
        userName: profile.displayName,
      })
      toast.success(`${selected.name}: ${result.before} → ${result.after}`)
      setSelected(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', storeId] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-logs', storeId] }),
      ])
    } catch (err) {
      toast.error((err as Error).message || 'Could not adjust stock.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Stock"
        title="Inventory"
        description="Receive stock, fix counts, and watch low shelves."
      />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'On shelf', value: String(products.filter((p) => p.isActive).length), icon: Package },
          { label: 'Low stock', value: String(lowCount), icon: AlertTriangle },
          { label: 'Out', value: String(outCount), icon: PackageMinus },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-[var(--bb-muted)]">{stat.label}</p>
                <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">{stat.value}</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl text-white bb-blend-bg">
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass flex flex-wrap items-center gap-2 rounded-[1.25rem] p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bb-muted)]" />
          <Input
            className="pl-9"
            placeholder="Search product, barcode, SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {([
          ['all', 'All'],
          ['low', 'Low'],
          ['out', 'Out'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'h-9 rounded-xl px-3 text-[12px] font-bold',
              filter === id
                ? 'bb-blend-bg text-white'
                : 'bg-white text-[var(--bb-muted)] ring-1 ring-[var(--bb-border)]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-1.5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/70" />
            ))
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl px-4 py-10 text-center text-[13px] font-medium text-[var(--bb-muted)]">
              No products match this filter.
            </div>
          ) : (
            filtered.map((product) => {
              const low = product.stockQuantity <= product.lowStockThreshold
              return (
                <div
                  key={product.id}
                  className="glass flex items-center gap-2 rounded-2xl p-2"
                >
                  <ProductCartwheel
                    src={product.imageUrl}
                    path={product.imagePath}
                    alt={product.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-[var(--bb-ink)]">{product.name}</p>
                    <p className="truncate text-[11px] text-[var(--bb-muted)]">
                      {product.barcode} · {formatZar(product.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-[family-name:var(--font-display)] text-[1.05rem] font-extrabold',
                        product.stockQuantity <= 0
                          ? 'text-[var(--bb-danger)]'
                          : low
                            ? 'text-[var(--bb-warning)]'
                            : 'text-[var(--bb-ink)]',
                      )}
                    >
                      {product.stockQuantity}
                    </p>
                    <p className="text-[10px] font-semibold text-[var(--bb-muted)]">
                      low ≤ {product.lowStockThreshold}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" className="h-8 px-2" onClick={() => openAdjust(product, 'receive')}>
                      <PackagePlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2"
                      onClick={() => openAdjust(product, 'remove')}
                    >
                      <PackageMinus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => openAdjust(product, 'set')}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="glass-strong rounded-2xl p-3">
          <h2 className="text-[13px] font-bold text-[var(--bb-ink)]">Recent moves</h2>
          <div className="mt-2 max-h-[60vh] space-y-1.5 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="py-6 text-center text-[12px] font-medium text-[var(--bb-muted)]">
                Adjustments will show here.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-xl bg-[var(--bb-bg)] px-2.5 py-2">
                  <p className="truncate text-[12px] font-bold text-[var(--bb-ink)]">{log.productName}</p>
                  <p className="text-[11px] font-semibold text-[var(--bb-muted)]">
                    {log.type} · {log.quantityBefore} → {log.quantityAfter}
                  </p>
                  <p className="truncate text-[10px] text-[var(--bb-muted)]">{log.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AppModal open={Boolean(selected)} onClose={() => setSelected(null)} labelledBy="Adjust stock">
        {selected ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--bb-muted)]">
                Adjust stock
              </p>
              <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
                {selected.name}
              </h2>
              <p className="text-[12px] text-[var(--bb-muted)]">On hand: {selected.stockQuantity}</p>
            </div>

            <div className="flex gap-1.5">
              {([
                ['receive', 'Receive'],
                ['remove', 'Remove'],
                ['set', 'Set count'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAdjustType(id)}
                  className={cn(
                    'h-9 flex-1 rounded-xl text-[12px] font-bold',
                    adjustType === id
                      ? 'bb-blend-bg text-white'
                      : 'bg-[var(--bb-bg)] text-[var(--bb-muted)] ring-1 ring-[var(--bb-border)]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Input
              label={adjustType === 'set' ? 'New quantity' : 'Quantity'}
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Reason"
              placeholder="Delivery, breakage, count…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={saving} onClick={() => void submitAdjust()}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  )
}
