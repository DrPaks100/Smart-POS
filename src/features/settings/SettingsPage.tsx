import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Moon, Palette, Save, Store, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { STORE_ID } from '@/constants'
import { updateUserProfileFields, resetPassword } from '@/services/authService'
import {
  DEFAULT_STORE_SETTINGS,
  getStoreSettings,
  saveStoreSettings,
} from '@/services/settingsService'
import { useAuthStore } from '@/stores/authStore'
import { THEME_OPTIONS, useThemeStore } from '@/stores/themeStore'
import { cn } from '@/utils'
import type { ThemeId } from '@/types'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const storeId = profile?.storeId ?? STORE_ID
  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)

  const { data: settings } = useQuery({
    queryKey: ['settings', storeId],
    queryFn: () => getStoreSettings(storeId),
  })

  const [storeName, setStoreName] = useState(DEFAULT_STORE_SETTINGS.storeName)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [vatPercent, setVatPercent] = useState('15')
  const [clubDiscountPercent, setClubDiscountPercent] = useState('5')
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [userPhone, setUserPhone] = useState(profile?.phone ?? '')
  const [savingStore, setSavingStore] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!settings) return
    setStoreName(settings.storeName)
    setPhone(settings.phone ?? '')
    setEmail(settings.email ?? '')
    setAddress(settings.address ?? '')
    setVatPercent(String(settings.vatPercent))
    setClubDiscountPercent(String(settings.clubDiscountPercent))
    if (settings.themeId && settings.themeId !== themeId) {
      setTheme(settings.themeId)
    }
  }, [settings]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '')
    setUserPhone(profile?.phone ?? '')
  }, [profile])

  async function saveStore() {
    setSavingStore(true)
    try {
      await saveStoreSettings(storeId, {
        storeName,
        phone,
        email,
        address,
        vatPercent: Number(vatPercent) || 15,
        clubDiscountPercent: Number(clubDiscountPercent) || 5,
        themeId,
      })
      toast.success('Store settings saved')
      await queryClient.invalidateQueries({ queryKey: ['settings', storeId] })
    } catch (err) {
      toast.error((err as Error).message || 'Could not save settings.')
    } finally {
      setSavingStore(false)
    }
  }

  async function saveProfile() {
    if (!profile) return
    setSavingProfile(true)
    try {
      await updateUserProfileFields(profile.uid, {
        displayName,
        phone: userPhone,
      })
      useAuthStore.setState({
        profile: { ...profile, displayName: displayName.trim(), phone: userPhone.trim() || undefined },
      })
      toast.success('Profile updated')
    } catch (err) {
      toast.error((err as Error).message || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function sendReset() {
    if (!profile?.email) return
    try {
      await resetPassword(profile.email)
      toast.success('Password reset email sent')
    } catch (err) {
      toast.error((err as Error).message || 'Could not send reset email.')
    }
  }

  async function pickTheme(id: ThemeId) {
    setTheme(id)
    try {
      await saveStoreSettings(storeId, {
        storeName,
        phone,
        email,
        address,
        vatPercent: Number(vatPercent) || 15,
        clubDiscountPercent: Number(clubDiscountPercent) || 5,
        themeId: id,
      })
      await queryClient.invalidateQueries({ queryKey: ['settings', storeId] })
    } catch {
      /* local theme still applies */
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Control"
        title="Settings"
        description="Store details, till rules, look & feel, and your profile."
      />

      <section className="glass rounded-[1.25rem] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bb-blend-bg">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-extrabold text-[var(--bb-ink)]">Theme</h2>
            <p className="text-[12px] text-[var(--bb-muted)]">Switch look instantly — saved for the store.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => void pickTheme(opt.id)}
              className={cn(
                'rounded-2xl p-3 text-left ring-1 transition',
                themeId === opt.id
                  ? 'bb-blend-bg text-white ring-transparent shadow-[0_8px_20px_rgba(37,99,235,0.25)]'
                  : 'bg-[var(--bb-surface)] text-[var(--bb-ink)] ring-[var(--bb-border)] hover:bg-[var(--bb-bg)]',
              )}
            >
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold">
                {opt.id === 'dark' ? <Moon className="h-3.5 w-3.5" /> : null}
                {opt.label}
              </p>
              <p className={cn('mt-0.5 text-[11px] font-medium', themeId === opt.id ? 'text-white/80' : 'text-[var(--bb-muted)]')}>
                {opt.hint}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-[1.25rem] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bb-blend-bg">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-extrabold text-[var(--bb-ink)]">Store</h2>
            <p className="text-[12px] text-[var(--bb-muted)]">Name, contact, VAT, Bright Club %.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="VAT %" type="number" min={0} value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} />
          <Input
            label="Bright Club discount %"
            type="number"
            min={0}
            value={clubDiscountPercent}
            onChange={(e) => setClubDiscountPercent(e.target.value)}
          />
        </div>
        <Button className="mt-3" loading={savingStore} onClick={() => void saveStore()}>
          <Save className="h-4 w-4" />
          Save store
        </Button>
      </section>

      <section className="glass rounded-[1.25rem] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bb-blend-bg">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-extrabold text-[var(--bb-ink)]">Your profile</h2>
            <p className="text-[12px] text-[var(--bb-muted)]">{profile?.email}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Phone" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button loading={savingProfile} onClick={() => void saveProfile()}>
            <Save className="h-4 w-4" />
            Save profile
          </Button>
          <Button variant="secondary" onClick={() => void sendReset()}>
            Send password reset
          </Button>
        </div>
      </section>
    </div>
  )
}
