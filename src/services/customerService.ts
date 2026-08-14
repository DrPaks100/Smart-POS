import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { STORE_ID } from '@/constants'
import type { Customer } from '@/types'

function mapCustomer(snap: QueryDocumentSnapshot<DocumentData>): Customer {
  const data = snap.data()
  return {
    id: snap.id,
    storeId: String(data.storeId ?? STORE_ID),
    name: String(data.name ?? ''),
    phone: data.phone ? String(data.phone) : undefined,
    email: data.email ? String(data.email) : undefined,
    memberCard: data.memberCard ? String(data.memberCard) : undefined,
    notes: data.notes ? String(data.notes) : undefined,
    isActive: data.isActive !== false,
    visits: Number(data.visits ?? 0),
    totalSpent: Number(data.totalSpent ?? 0),
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  }
}

export async function listCustomers(storeId = STORE_ID): Promise<Customer[]> {
  try {
    const q = query(
      collection(db, 'customers'),
      where('storeId', '==', storeId),
      orderBy('name'),
    )
    const snap = await getDocs(q)
    return snap.docs.map(mapCustomer)
  } catch {
    const snap = await getDocs(
      query(collection(db, 'customers'), where('storeId', '==', storeId)),
    )
    return snap.docs
      .map(mapCustomer)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }
}

export async function findCustomerByCard(
  card: string,
  storeId = STORE_ID,
): Promise<Customer | null> {
  const trimmed = card.trim()
  if (!trimmed) return null
  try {
    const q = query(
      collection(db, 'customers'),
      where('storeId', '==', storeId),
      where('memberCard', '==', trimmed),
      where('isActive', '==', true),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    return mapCustomer(snap.docs[0]!)
  } catch {
    const all = await listCustomers(storeId)
    return (
      all.find(
        (c) =>
          c.isActive &&
          c.memberCard?.trim().toLowerCase() === trimmed.toLowerCase(),
      ) ?? null
    )
  }
}

export async function createCustomer(
  input: Omit<Customer, 'id' | 'visits' | 'totalSpent' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = doc(collection(db, 'customers'))
  await setDoc(ref, {
    storeId: input.storeId,
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    memberCard: input.memberCard?.trim() || null,
    notes: input.notes?.trim() || null,
    isActive: input.isActive,
    visits: 0,
    totalSpent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCustomer(
  id: string,
  input: Partial<Omit<Customer, 'id' | 'createdAt'>>,
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  const keys = [
    'name',
    'phone',
    'email',
    'memberCard',
    'notes',
    'isActive',
    'visits',
    'totalSpent',
    'storeId',
  ] as const
  for (const key of keys) {
    if (key in input && input[key] !== undefined) {
      const value = input[key]
      payload[key] =
        typeof value === 'string' ? value.trim() || null : (value ?? null)
    }
  }
  await updateDoc(doc(db, 'customers', id), payload)
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'customers', id))
}
