import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Package, Receipt, Sparkles, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/Card'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { STORE_ID } from '@/constants'
import { listProducts } from '@/services/productService'
import { listSales } from '@/services/saleService'
import { useAuthStore } from '@/stores/authStore'
import { formatZar } from '@/utils'

function startOfDay(offsetDays = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}

function floorGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { kicker: 'Morning on the floor', line: 'The till is warm. Let’s make it sing.' }
  if (hour < 17) return { kicker: 'Afternoon trade', line: 'Keep the rands moving. Stay bright.' }
  return { kicker: 'Evening close', line: 'Finish strong. Every ticket counts.' }
}

export function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const hello = floorGreeting()
  const todayLabel = new Date().toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
  })

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', storeId],
    queryFn: () => listSales(storeId, 120),
  })

  const today = startOfDay()
  const week = startOfDay(-6)
  const month = new Date(today.getFullYear(), today.getMonth(), 1)

  const todayTotal = useMemo(
    () => sales.filter((s) => s.createdAt && s.createdAt >= today).reduce((sum, s) => sum + s.total, 0),
    [sales, today],
  )
  const todayCount = useMemo(
    () => sales.filter((s) => s.createdAt && s.createdAt >= today).length,
    [sales, today],
  )
  const weekTotal = useMemo(
    () => sales.filter((s) => s.createdAt && s.createdAt >= week).reduce((sum, s) => sum + s.total, 0),
    [sales, week],
  )
  const monthTotal = useMemo(
    () => sales.filter((s) => s.createdAt && s.createdAt >= month).reduce((sum, s) => sum + s.total, 0),
    [sales, month],
  )

  const weekBars = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = startOfDay(i - 6)
      const next = startOfDay(i - 5)
      return sales
        .filter((s) => s.createdAt && s.createdAt >= day && s.createdAt < next)
        .reduce((sum, s) => sum + s.total, 0)
    })
  }, [sales])

  const photos = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.imageUrl])),
    [products],
  )
  const maxBar = Math.max(...weekBars, 1)
  const lowStock = products
    .filter((p) => p.isActive && p.stockQuantity <= p.lowStockThreshold)
    .slice(0, 5)
  const recent = sales.slice(0, 5)
  const activeCount = products.filter((p) => p.isActive).length

  return (
    <div className="space-y-3">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-2xl px-3 py-2.5"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-70 bb-blend-bg blur-2xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--bb-muted)]">
              {todayLabel}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--bb-muted)]">
              {hello.kicker}
            </p>
            <h1 className="mt-0.5 text-[1.35rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[1.55rem] md:text-[1.75rem]">
              <span className="font-[family-name:var(--font-bubble)] text-[var(--bb-ink)]">Hey, </span>
              <span className="font-[family-name:var(--font-display)] bb-blend-text">Best Brightness</span>
            </h1>
            <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--bb-muted)]">{hello.line}</p>
          </div>
          <div className="shrink-0 self-start rounded-xl bg-white/80 px-3 py-1.5 text-left ring-1 ring-[var(--bb-border)] sm:self-auto sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--bb-muted)]">Today on the till</p>
            <p className="font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold leading-none bb-blend-text">
              {formatZar(todayTotal)}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-[var(--bb-muted)]">
              {todayCount} sale{todayCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
          { label: 'Today', value: formatZar(todayTotal), hint: `${todayCount} tickets`, icon: TrendingUp },
          { label: 'This week', value: formatZar(weekTotal), hint: 'Last 7 days', icon: Receipt },
          { label: 'This month', value: formatZar(monthTotal), hint: 'Floor total', icon: Sparkles },
          { label: 'On shelf', value: String(activeCount), hint: 'Active products', icon: Package },
        ].map((stat, i) => (
          <GlassCard key={stat.label} delay={0.03 * i} className="p-3" hover={false}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[var(--bb-muted)]">{stat.label}</p>
                <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold tracking-[-0.03em]">
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium text-[var(--bb-muted)]">{stat.hint}</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white bb-blend-bg">
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-5">
        <GlassCard className="p-3 lg:col-span-3" hover={false}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-bold">Week on the till</h2>
            <span className="rounded-full bg-[var(--bb-blend-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--bb-blue)]">
              7 days
            </span>
          </div>
          <div className="flex h-28 items-end gap-1.5">
            {weekBars.map((amount, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg"
                style={{
                  height: `${Math.max(8, (amount / maxBar) * 100)}%`,
                  background:
                    i === 6 ? 'var(--bb-blend)' : 'linear-gradient(180deg, #e8eefc 0%, #f1f5f9 100%)',
                }}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-3 lg:col-span-2" hover={false}>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--bb-warning)]" />
            <h2 className="text-[13px] font-bold">Low stock</h2>
          </div>
          <div className="space-y-1">
            {lowStock.length === 0 ? (
              <p className="rounded-xl bg-[#f6f7fb] px-2.5 py-2 text-[12px] font-medium text-[var(--bb-muted)]">
                Shelf looks healthy
              </p>
            ) : (
              lowStock.map((product) => (
                <div key={product.id} className="flex items-center gap-2 rounded-xl bg-[#f6f7fb] px-2 py-1">
                  <ProductCartwheel src={product.imageUrl} path={product.imagePath} alt={product.name} size="sm" />
                  <p className="min-w-0 flex-1 truncate text-[12px] font-bold">{product.name}</p>
                  <p className="text-[11px] font-bold text-amber-700">{product.stockQuantity}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-3" hover={false}>
        <h2 className="text-[13px] font-bold">Latest purchases</h2>
        {recent.length === 0 ? (
          <p className="mt-1 text-[12px] font-medium text-[var(--bb-muted)]">
            Complete a sale on POS and it lands here — cash, card, or EFT.
          </p>
        ) : (
          <div className="mt-2 space-y-1">
            {recent.map((sale) => (
              <div key={sale.id} className="flex items-center gap-2 rounded-xl bg-[#f6f7fb] px-2 py-1">
                <div className="flex -space-x-1.5">
                  {sale.items.slice(0, 3).map((item) => (
                    <ProductCartwheel
                      key={`${sale.id}-${item.productId}`}
                      src={item.imageUrl || photos[item.productId]}
                      alt={item.name}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold">{sale.items.map((i) => i.name).join(', ')}</p>
                  <p className="text-[10px] font-medium text-[var(--bb-muted)]">
                    {sale.createdAt
                      ? sale.createdAt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}{' '}
                    · {sale.paymentMethod.toUpperCase()}
                  </p>
                </div>
                <p className="text-[12px] font-extrabold">{formatZar(sale.total)}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
