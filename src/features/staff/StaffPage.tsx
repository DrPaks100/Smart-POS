import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, KeyRound, Plus, Search, Shield, UserCog, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppModal } from '@/components/ui/AppModal'
import { ROLE_LABELS, STORE_ID } from '@/constants'
import {
  listStaff,
  registerStaff,
  sendStaffPasswordReset,
  updateStaff,
} from '@/services/staffService'
import { useAuthStore } from '@/stores/authStore'
import { authErrorMessage, cn } from '@/utils'
import type { UserProfile, UserRole } from '@/types'

type StaffRole = Extract<UserRole, 'manager' | 'cashier'>

const emptyForm = {
  displayName: '',
  email: '',
  password: '',
  phone: '',
  role: 'cashier' as StaffRole,
}

export function StaffPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState<StaffRole>('cashier')
  const [saving, setSaving] = useState(false)

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', storeId],
    queryFn: () => listStaff(storeId),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = staff.filter((u) => u.role !== 'admin' || u.uid === profile?.uid)
    if (!q) return list
    return list.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.includes(q),
    )
  }, [staff, query, profile?.uid])

  const managers = staff.filter((u) => u.role === 'manager').length
  const cashiers = staff.filter((u) => u.role === 'cashier').length

  function openCreate() {
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(user: UserProfile) {
    if (user.role === 'admin') {
      toast.message('Admin profile is managed in Settings.')
      return
    }
    setEditing(user)
    setEditName(user.displayName)
    setEditPhone(user.phone ?? '')
    setEditRole(user.role as StaffRole)
  }

  async function create() {
    setSaving(true)
    try {
      await registerStaff({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        storeId,
      })
      toast.success(`${form.role === 'manager' ? 'Manager' : 'Cashier'} registered`)
      setOpen(false)
      setForm(emptyForm)
      await queryClient.invalidateQueries({ queryKey: ['staff', storeId] })
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      toast.error(authErrorMessage(code) || (err as Error).message || 'Could not register staff.')
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    try {
      await updateStaff(editing.uid, {
        displayName: editName,
        phone: editPhone,
        role: editRole,
      })
      toast.success('Staff updated')
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['staff', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not update staff.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(user: UserProfile) {
    if (user.uid === profile?.uid) {
      toast.error('You cannot deactivate your own account.')
      return
    }
    try {
      await updateStaff(user.uid, { isActive: !user.isActive })
      toast.success(user.isActive ? 'Staff deactivated' : 'Staff activated')
      await queryClient.invalidateQueries({ queryKey: ['staff', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not update status.')
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendStaffPasswordReset(email)
      toast.success('Password reset email sent')
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      toast.error(authErrorMessage(code) || (err as Error).message)
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Team"
        title="Staff"
        description="Register managers and cashiers. They log in with limited access."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Register staff
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Team', value: String(staff.length), icon: Users },
          { label: 'Managers', value: String(managers), icon: Shield },
          { label: 'Cashiers', value: String(cashiers), icon: BadgeCheck },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-[var(--bb-muted)]">{stat.label}</p>
                <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl text-white bb-blend-bg">
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass flex items-center gap-3 rounded-[1.25rem] p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bb-muted)]" />
          <Input
            className="pl-9"
            placeholder="Search name, email, role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/70" />
            ))
          : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="glass col-span-full rounded-2xl px-4 py-12 text-center text-[13px] font-medium text-[var(--bb-muted)]">
            No staff yet. Register a manager or cashier to get started.
          </div>
        ) : null}

        {filtered.map((user) => (
          <div key={user.uid} className="glass rounded-2xl p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white bb-blend-bg">
                {user.role === 'manager' ? (
                  <Shield className="h-4 w-4" />
                ) : user.role === 'admin' ? (
                  <UserCog className="h-4 w-4" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-[family-name:var(--font-display)] text-[15px] font-extrabold text-[var(--bb-ink)]">
                    {user.displayName}
                  </p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {user.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-[var(--bb-muted)]">{user.email}</p>
                <p className="mt-1 text-[11px] font-bold bb-blend-text">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>

            {user.role !== 'admin' ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void resetPassword(user.email)}>
                  <KeyRound className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void toggleActive(user)}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-[11px] font-medium text-[var(--bb-muted)]">
                Full access · managed in Settings
              </p>
            )}
          </div>
        ))}
      </div>

      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="Register staff"
        panelClassName="relative z-[1] w-full max-w-[420px] max-h-[min(92vh,720px)] overflow-y-auto rounded-[1.25rem] bg-[var(--bb-surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
      >
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
            Register staff
          </h2>
          <p className="text-[12px] font-medium text-[var(--bb-muted)]">
            Create a login for a manager or cashier. They will only see their allowed pages.
          </p>

          <div className="flex gap-1.5">
            {([
              ['cashier', 'Cashier'],
              ['manager', 'Manager'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: id }))}
                className={cn(
                  'h-9 flex-1 rounded-xl text-[12px] font-bold',
                  form.role === id
                    ? 'bb-blend-bg text-white'
                    : 'bg-[var(--bb-bg)] text-[var(--bb-muted)] ring-1 ring-[var(--bb-border)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Input
            label="Full name"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="Thabo Molefe"
          />
          <Input
            label="Email (login)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="thabo@bestbrightness.co.za"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="At least 6 characters"
          />
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />

          <div className="rounded-xl bg-[var(--bb-blend-soft)] px-3 py-2 text-[11px] font-semibold text-[var(--bb-ink)]">
            {form.role === 'cashier'
              ? 'Cashier access: Dashboard, POS, Customers.'
              : 'Manager access: Dashboard, POS, Products, Inventory, Customers, Suppliers, Reports.'}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={() => void create()}>
              Register
            </Button>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        labelledBy="Edit staff"
        panelClassName="relative z-[1] w-full max-w-[400px] max-h-[min(92vh,640px)] overflow-y-auto rounded-[1.25rem] bg-[var(--bb-surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
      >
        {editing ? (
          <div className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold">
              Edit staff
            </h2>
            <p className="text-[12px] text-[var(--bb-muted)]">{editing.email}</p>
            <Input label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <div className="flex gap-1.5">
              {([
                ['cashier', 'Cashier'],
                ['manager', 'Manager'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEditRole(id)}
                  className={cn(
                    'h-9 flex-1 rounded-xl text-[12px] font-bold',
                    editRole === id
                      ? 'bb-blend-bg text-white'
                      : 'bg-[var(--bb-bg)] text-[var(--bb-muted)] ring-1 ring-[var(--bb-border)]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={saving} onClick={() => void saveEdit()}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  )
}
