import {
  collection,
  deleteDoc,
  doc,
  getDocs,
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
import type { Supplier } from '@/types'

function mapSupplier(snap: QueryDocumentSnapshot<DocumentData>): Supplier {
  const data = snap.data()
  return {
    id: snap.id,
    storeId: String(data.storeId ?? STORE_ID),
    name: String(data.name ?? ''),
    contactName: data.contactName ? String(data.contactName) : undefined,
    phone: data.phone ? String(data.phone) : undefined,
    email: data.email ? String(data.email) : undefined,
    address: data.address ? String(data.address) : undefined,
    notes: data.notes ? String(data.notes) : undefined,
    isActive: data.isActive !== false,
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  }
}

export async function listSuppliers(storeId = STORE_ID): Promise<Supplier[]> {
  try {
    const q = query(
      collection(db, 'suppliers'),
      where('storeId', '==', storeId),
      orderBy('name'),
    )
    const snap = await getDocs(q)
    return snap.docs.map(mapSupplier)
  } catch {
    const snap = await getDocs(
      query(collection(db, 'suppliers'), where('storeId', '==', storeId)),
    )
    return snap.docs
      .map(mapSupplier)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }
}

export async function createSupplier(
  input: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = doc(collection(db, 'suppliers'))
  await setDoc(ref, {
    storeId: input.storeId,
    name: input.name.trim(),
    contactName: input.contactName?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
    notes: input.notes?.trim() || null,
    isActive: input.isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSupplier(
  id: string,
  input: Partial<Omit<Supplier, 'id' | 'createdAt'>>,
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  const keys = [
    'name',
    'contactName',
    'phone',
    'email',
    'address',
    'notes',
    'isActive',
    'storeId',
  ] as const
  for (const key of keys) {
    if (key in input && input[key] !== undefined) {
      const value = input[key]
      payload[key] =
        typeof value === 'string' ? value.trim() || null : (value ?? null)
    }
  }
  await updateDoc(doc(db, 'suppliers', id), payload)
}

export async function deleteSupplier(id: string): Promise<void> {
  await deleteDoc(doc(db, 'suppliers', id))
}
