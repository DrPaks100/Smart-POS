import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IdCard, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppModal } from '@/components/ui/AppModal'
import { STORE_ID } from '@/constants'
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from '@/services/customerService'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatZar } from '@/utils'
import type { Customer } from '@/types'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  memberCard: '',
  notes: '',
  isActive: true,
}

export function CustomersPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', storeId],
    queryFn: () => listCustomers(storeId),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.memberCard?.toLowerCase().includes(q),
    )
  }, [customers, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    setForm({
      name: customer.name,
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      memberCard: customer.memberCard ?? '',
      notes: customer.notes ?? '',
      isActive: customer.isActive,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error('Customer name is required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateCustomer(editing.id, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          memberCard: form.memberCard,
          notes: form.notes,
          isActive: form.isActive,
        })
        toast.success('Customer updated')
      } else {
        await createCustomer({
          storeId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          memberCard: form.memberCard,
          notes: form.notes,
          isActive: form.isActive,
        })
        toast.success('Customer added')
      }
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['customers', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not save customer.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(customer: Customer) {
    if (!window.confirm(`Remove ${customer.name}?`)) return
    try {
      await deleteCustomer(customer.id)
      toast.success('Customer removed')
      await queryClient.invalidateQueries({ queryKey: ['customers', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not remove customer.')
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Bright Club cards and walk-in regulars."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        }
      />

      <div className="glass flex items-center gap-3 rounded-[1.25rem] p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bb-muted)]" />
          <Input
            className="pl-9"
            placeholder="Search name, phone, email, club card…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-[12px] font-semibold text-[var(--bb-muted)]">
          {filtered.length} customer{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
            ))
          : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="glass col-span-full rounded-2xl px-4 py-12 text-center text-[13px] font-medium text-[var(--bb-muted)]">
            No customers yet. Add a Bright Club member to start.
          </div>
        ) : null}

        {filtered.map((customer) => (
          <div key={customer.id} className="glass rounded-2xl p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white bb-blend-bg">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-[family-name:var(--font-display)] text-[15px] font-extrabold text-[var(--bb-ink)]">
                    {customer.name}
                  </p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      customer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {customer.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-[var(--bb-muted)]">
                  {customer.phone || customer.email || 'No contact'}
                </p>
                {customer.memberCard ? (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[var(--bb-blend-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--bb-blue)]">
                    <IdCard className="h-3 w-3" />
                    {customer.memberCard}
                  </p>
                ) : null}
                <p className="mt-1.5 text-[11px] font-semibold text-[var(--bb-muted)]">
                  {customer.visits} visits · {formatZar(customer.totalSpent)}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(customer)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void remove(customer)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="Customer"
        panelClassName="relative z-[1] w-full max-w-[400px] max-h-[min(92vh,680px)] overflow-y-auto rounded-[1.25rem] bg-[var(--bb-surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
      >
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
            {editing ? 'Edit customer' : 'Add customer'}
          </h2>
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Bright Club card"
            placeholder="Scan or type card number"
            value={form.memberCard}
            onChange={(e) => setForm((f) => ({ ...f, memberCard: e.target.value }))}
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--bb-ink)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active customer
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={() => void save()}>
              Save
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
