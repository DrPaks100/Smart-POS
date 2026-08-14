import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Pencil, Plus, Search, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppModal } from '@/components/ui/AppModal'
import { STORE_ID } from '@/constants'
import { listProducts, updateProduct } from '@/services/productService'
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
} from '@/services/supplierService'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils'
import type { Supplier } from '@/types'

const emptyForm = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  isActive: true,
}

export function SuppliersPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [linkSupplierId, setLinkSupplierId] = useState<string | null>(null)
  const [linkProductId, setLinkProductId] = useState('')

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', storeId],
    queryFn: () => listSuppliers(storeId),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => listProducts(storeId),
  })

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      if (!p.supplierId) continue
      map.set(p.supplierId, (map.get(p.supplierId) ?? 0) + 1)
    }
    return map
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.contactName?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.email?.toLowerCase().includes(q),
    )
  }, [suppliers, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setForm({
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
      isActive: supplier.isActive,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error('Supplier name is required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateSupplier(editing.id, form)
        toast.success('Supplier updated')
      } else {
        await createSupplier({ storeId, ...form })
        toast.success('Supplier added')
      }
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['suppliers', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not save supplier.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(supplier: Supplier) {
    if (!window.confirm(`Remove ${supplier.name}? Linked products stay, but lose this supplier.`))
      return
    try {
      const linked = products.filter((p) => p.supplierId === supplier.id)
      await Promise.all(
        linked.map((p) =>
          updateProduct(p.id, { storeId, supplierId: undefined }),
        ),
      )
      await deleteSupplier(supplier.id)
      toast.success('Supplier removed')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suppliers', storeId] }),
        queryClient.invalidateQueries({ queryKey: ['products', storeId] }),
      ])
    } catch (err) {
      toast.error((err as Error).message || 'Could not remove supplier.')
    }
  }

  async function linkProduct() {
    if (!linkSupplierId || !linkProductId) {
      toast.error('Choose a product to link.')
      return
    }
    try {
      await updateProduct(linkProductId, { storeId, supplierId: linkSupplierId })
      toast.success('Product linked to supplier')
      setLinkSupplierId(null)
      setLinkProductId('')
      await queryClient.invalidateQueries({ queryKey: ['products', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not link product.')
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Buying"
        title="Suppliers"
        description="Who you buy from — link them to products for stock receives."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add supplier
          </Button>
        }
      />

      <div className="glass flex items-center gap-3 rounded-[1.25rem] p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bb-muted)]" />
          <Input
            className="pl-9"
            placeholder="Search supplier, contact, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-[12px] font-semibold text-[var(--bb-muted)]">
          {filtered.length} supplier{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/70" />
            ))
          : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="glass col-span-full rounded-2xl px-4 py-12 text-center text-[13px] font-medium text-[var(--bb-muted)]">
            No suppliers yet. Add your cleaning / household distributors.
          </div>
        ) : null}

        {filtered.map((supplier) => (
          <div key={supplier.id} className="glass rounded-2xl p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white bb-blend-bg">
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-[family-name:var(--font-display)] text-[15px] font-extrabold">
                    {supplier.name}
                  </p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      supplier.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {supplier.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-[var(--bb-muted)]">
                  {supplier.contactName || 'No contact'} · {supplier.phone || 'No phone'}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--bb-blue)]">
                  <Building2 className="h-3 w-3" />
                  {counts.get(supplier.id) ?? 0} product{(counts.get(supplier.id) ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(supplier)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setLinkSupplierId(supplier.id)
                  setLinkProductId('')
                }}
              >
                Link
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void remove(supplier)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AppModal open={open} onClose={() => setOpen(false)} labelledBy="Supplier"
        panelClassName="relative z-[1] w-full max-w-[420px] max-h-[min(92vh,720px)] overflow-y-auto rounded-[1.25rem] bg-[var(--bb-surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
      >
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
            {editing ? 'Edit supplier' : 'Add supplier'}
          </h2>
          <Input label="Company name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Contact person" value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active supplier
          </label>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={() => void save()}>Save</Button>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(linkSupplierId)}
        onClose={() => setLinkSupplierId(null)}
        labelledBy="Link product"
      >
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.1rem] font-extrabold">
            Link product
          </h2>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Product</span>
            <select
              value={linkProductId}
              onChange={(e) => setLinkProductId(e.target.value)}
              className="h-10 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-bg)] px-3 text-[14px] font-medium outline-none"
            >
              <option value="">Choose product…</option>
              {products
                .filter((p) => p.isActive)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setLinkSupplierId(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => void linkProduct()}>
              Link
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
