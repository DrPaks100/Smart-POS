import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { STORE_ID } from '@/constants'
import type { InventoryAdjustType, InventoryLog } from '@/types'

function mapLog(snap: QueryDocumentSnapshot<DocumentData>): InventoryLog {
  const data = snap.data()
  return {
    id: snap.id,
    storeId: String(data.storeId ?? STORE_ID),
    productId: String(data.productId ?? ''),
    productName: String(data.productName ?? ''),
    type: data.type as InventoryAdjustType,
    quantityBefore: Number(data.quantityBefore ?? 0),
    quantityAfter: Number(data.quantityAfter ?? 0),
    delta: Number(data.delta ?? 0),
    reason: String(data.reason ?? ''),
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? ''),
    createdAt: data.createdAt?.toDate?.() ?? undefined,
  }
}

export async function adjustStock(input: {
  productId: string
  type: InventoryAdjustType
  amount: number
  reason: string
  storeId?: string
  userId: string
  userName: string
}): Promise<{ before: number; after: number }> {
  const storeId = input.storeId ?? STORE_ID
  const amount = Math.floor(Math.abs(input.amount))
  if (amount <= 0 && input.type !== 'set') {
    throw new Error('Enter a quantity greater than zero.')
  }

  const productRef = doc(db, 'products', input.productId)

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(productRef)
    if (!snap.exists()) throw new Error('Product not found.')
    const data = snap.data()
    const before = Number(data.stockQuantity ?? 0)
    let after = before
    if (input.type === 'receive') after = before + amount
    else if (input.type === 'remove') after = Math.max(0, before - amount)
    else after = amount

    tx.update(productRef, {
      stockQuantity: after,
      updatedAt: serverTimestamp(),
    })

    return {
      before,
      after,
      productName: String(data.name ?? 'Product'),
    }
  })

  await addDoc(collection(db, 'inventory_logs'), {
    storeId,
    productId: input.productId,
    productName: result.productName,
    type: input.type,
    quantityBefore: result.before,
    quantityAfter: result.after,
    delta: result.after - result.before,
    reason: input.reason.trim() || 'Stock adjustment',
    userId: input.userId,
    userName: input.userName,
    createdAt: serverTimestamp(),
  })

  return { before: result.before, after: result.after }
}

export async function listInventoryLogs(
  storeId = STORE_ID,
  max = 40,
): Promise<InventoryLog[]> {
  try {
    const q = query(
      collection(db, 'inventory_logs'),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc'),
      limit(max),
    )
    const snap = await getDocs(q)
    return snap.docs.map(mapLog)
  } catch {
    const snap = await getDocs(
      query(collection(db, 'inventory_logs'), where('storeId', '==', storeId), limit(max)),
    )
    return snap.docs
      .map(mapLog)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
  }
}

export async function getProductStock(productId: string): Promise<number | null> {
  const snap = await getDoc(doc(db, 'products', productId))
  if (!snap.exists()) return null
  return Number(snap.data().stockQuantity ?? 0)
}
