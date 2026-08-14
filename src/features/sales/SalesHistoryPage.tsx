import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { STORE_ID } from '@/constants'
import { listProducts } from '@/services/productService'
import { listSales } from '@/services/saleService'
import { useAuthStore } from '@/stores/authStore'
import { downloadSalesCsv, downloadSalesSpreadsheet } from '@/utils/salesExport'
import { formatZar } from '@/utils'

export function SalesHistoryPage() {
  const storeId = useAuthStore((s) => s.profile?.storeId) ?? STORE_ID
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', storeId],
    queryFn: () => listSales(storeId, 200),
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
  })
  const photos = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.imageUrl])),
    [products],
  )

  const todayTotal = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return sales
      .filter((s) => s.createdAt && s.createdAt >= start)
      .reduce((sum, s) => sum + s.total, 0)
  }, [sales])

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Reports"
        title="Sales history"
        description="Every completed till sale. Download CSV or a branded spreadsheet with the Best Brightness logo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-bold text-[var(--bb-muted)]">
              Today {formatZar(todayTotal)}
            </p>
            <Button
              variant="secondary"
              size="sm"
              disabled={sales.length === 0}
              onClick={() => downloadSalesCsv(sales)}
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button
              size="sm"
              disabled={sales.length === 0}
              onClick={() => void downloadSalesSpreadsheet(sales)}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Spreadsheet
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : null}

      {!isLoading && sales.length === 0 ? (
        <div className="glass rounded-2xl px-4 py-12 text-center">
          <Receipt className="mx-auto h-6 w-6 text-[var(--bb-muted)] opacity-50" />
          <p className="mt-2 text-[14px] font-bold text-[var(--bb-ink)]">No sales yet</p>
          <p className="mt-0.5 text-[12px] font-medium text-[var(--bb-muted)]">
            Complete a purchase on POS and it will land here.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {sales.map((sale) => (
          <article key={sale.id} className="glass rounded-2xl p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-[var(--bb-ink)]">
                  {sale.createdAt
                    ? sale.createdAt.toLocaleString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now'}
                </p>
                <p className="text-[11px] font-medium text-[var(--bb-muted)]">
                  {sale.cashierName} · {sale.paymentMethod.toUpperCase()}
                  {sale.paymentRef ? ` · ${sale.paymentRef}` : ''}
                </p>
              </div>
              <p className="font-[family-name:var(--font-display)] text-[15px] font-extrabold bb-blend-text">
                {formatZar(sale.total)}
              </p>
            </div>
            <div className="space-y-1">
              {sale.items.map((item) => (
                <div key={`${sale.id}-${item.productId}`} className="flex items-center gap-2">
                  <ProductCartwheel
                    src={item.imageUrl || photos[item.productId]}
                    alt={item.name}
                    size="sm"
                  />
                  <p className="min-w-0 flex-1 truncate text-[12px] font-bold text-[var(--bb-ink)]">
                    {item.name}
                  </p>
                  <p className="text-[11px] font-semibold text-[var(--bb-muted)]">×{item.quantity}</p>
                  <p className="text-[12px] font-extrabold text-[var(--bb-ink)]">
                    {formatZar(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
