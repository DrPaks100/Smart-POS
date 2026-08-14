import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { STORE_ID } from '@/constants'
import type { StoreSettings, ThemeId } from '@/types'

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: STORE_ID,
  storeId: STORE_ID,
  storeName: 'Best Brightness',
  phone: '',
  email: 'admin@bestbrightness.co.za',
  address: '',
  vatPercent: 15,
  clubDiscountPercent: 5,
  themeId: 'brand',
  currency: 'ZAR',
}

export async function getStoreSettings(storeId = STORE_ID): Promise<StoreSettings> {
  const snap = await getDoc(doc(db, 'settings', storeId))
  if (!snap.exists()) return { ...DEFAULT_STORE_SETTINGS, id: storeId, storeId }
  const data = snap.data()
  return {
    id: snap.id,
    storeId: String(data.storeId ?? storeId),
    storeName: String(data.storeName ?? DEFAULT_STORE_SETTINGS.storeName),
    phone: data.phone ? String(data.phone) : '',
    email: data.email ? String(data.email) : '',
    address: data.address ? String(data.address) : '',
    vatPercent: Number(data.vatPercent ?? 15),
    clubDiscountPercent: Number(data.clubDiscountPercent ?? 5),
    themeId: (data.themeId as ThemeId) || 'brand',
    currency: 'ZAR',
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  }
}

export async function saveStoreSettings(
  storeId: string,
  input: Partial<Omit<StoreSettings, 'id' | 'storeId' | 'currency'>>,
): Promise<void> {
  await setDoc(
    doc(db, 'settings', storeId),
    {
      storeId,
      storeName: input.storeName?.trim() || DEFAULT_STORE_SETTINGS.storeName,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      vatPercent: Number(input.vatPercent ?? 15),
      clubDiscountPercent: Number(input.clubDiscountPercent ?? 5),
      themeId: input.themeId ?? 'brand',
      currency: 'ZAR',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
