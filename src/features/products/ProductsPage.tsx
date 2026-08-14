import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Package,
  PackagePlus,
  Pencil,
  Search,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProductCartwheel } from '@/features/products/ProductCartwheel'
import { ProductComposer } from '@/features/products/ProductComposer'
import { listProducts } from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatZar } from '@/utils'
import type { Product } from '@/types'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const [query, setQuery] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const { data: products = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', profile?.storeId],
    queryFn: () => listProducts(profile?.storeId),
    enabled: Boolean(profile),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        p.category.toLowerCase().includes(q),
    )
  }, [products, query])

  function openCreate() {
    setEditing(null)
    setComposerOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setComposerOpen(true)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Each product is its own card with photo. Put size in the name, e.g. 500ml."
        actions={
          <Button onClick={openCreate}>
            <PackagePlus className="h-4 w-4" />
            Add product
          </Button>
        }
      />

      <div className="glass flex flex-wrap items-center gap-3 rounded-[1.25rem] p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bb-muted)]" />
          <Input
            className="pl-9"
            placeholder="Search name, barcode, SKU, brand…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-[12px] font-semibold text-[var(--bb-muted)]">
          {filtered.length} product{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="glass rounded-[1.25rem] p-4">
          <p className="text-[14px] font-semibold text-[var(--bb-danger)]">
            Could not load products
          </p>
          <p className="mt-1 text-[13px] text-[var(--bb-muted)]">
            {(error as Error)?.message?.includes('permission')
              ? 'Publish Firestore rules so signed-in staff can read the products collection.'
              : (error as Error)?.message || 'Check your connection and try again.'}
          </p>
          <Button className="mt-3" variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex flex-col items-center rounded-[1.5rem] px-6 py-14 text-center"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[1.25rem] text-white bb-blend-bg">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.03em]">
            {query ? 'No matches' : 'Your shelf is empty'}
          </h3>
          <p className="mt-1 max-w-md text-[13px] font-medium text-[var(--bb-muted)]">
            {query
              ? 'Try another search, or clear the filter.'
              : 'Add Valpré once with its barcode and set stock to 100 — not 100 separate products.'}
          </p>
          {!query ? (
            <Button className="mt-4" onClick={openCreate}>
              <PackagePlus className="h-4 w-4" />
              Register first product
            </Button>
          ) : null}
        </motion.div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product, index) => {
          const low =
            product.stockQuantity <= product.lowStockThreshold && product.isActive
          return (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.2) }}
              className="glass flex flex-col items-center rounded-2xl p-2.5"
            >
              <ProductCartwheel src={product.imageUrl} path={product.imagePath} alt={product.name} size="md" />

              <div className="mt-2 min-w-0 w-full text-center">
                <h3 className="truncate font-[family-name:var(--font-display)] text-[13px] font-bold tracking-[-0.02em] text-[var(--bb-ink)]">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[13px] font-extrabold text-[var(--bb-blue)]">
                  {formatZar(product.sellingPrice)}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--bb-muted)]">
                  {product.barcode}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[10px] font-semibold',
                    low ? 'text-amber-700' : 'text-[var(--bb-muted)]',
                  )}
                >
                  {low ? <AlertTriangle className="mr-0.5 inline h-3 w-3" /> : null}
                  Stock {product.stockQuantity}
                  {!product.isActive ? ' · Off' : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openEdit(product)}
                className="mt-2 flex h-7 w-full items-center justify-center gap-1 rounded-lg bg-white text-[11px] font-bold text-[var(--bb-ink)] shadow-sm ring-1 ring-[var(--bb-border)]"
                aria-label={`Edit ${product.name}`}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </motion.article>
          )
        })}
      </div>

      <ProductComposer
        open={composerOpen}
        product={editing}
        uid={profile?.uid}
        onClose={() => {
          setComposerOpen(false)
          setEditing(null)
        }}
        onSaved={(saved) => {
          queryClient.setQueryData<Product[]>(['products', profile?.storeId], (old) => {
            const list = old ?? []
            const idx = list.findIndex((p) => p.id === saved.id)
            if (idx >= 0) {
              const next = [...list]
              next[idx] = saved
              return next
            }
            return [...list, saved].sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
            )
          })
          void queryClient.invalidateQueries({ queryKey: ['products'] })
        }}
      />
    </div>
  )
}
