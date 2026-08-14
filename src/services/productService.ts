import {
  collection,
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
import type { Product } from '@/types'

function mapProduct(snap: QueryDocumentSnapshot<DocumentData>): Product {
  const data = snap.data()
  return {
    id: snap.id,
    name: String(data.name ?? ''),
    sku: String(data.sku ?? ''),
    barcode: String(data.barcode ?? ''),
    category: String(data.category ?? 'General'),
    brand: data.brand ? String(data.brand) : undefined,
    supplierId: data.supplierId ? String(data.supplierId) : undefined,
    description: data.description ? String(data.description) : undefined,
    unit: data.unit ? String(data.unit) : 'each',
    costPrice: Number(data.costPrice ?? 0),
    sellingPrice: Number(data.sellingPrice ?? 0),
    stockQuantity: Number(data.stockQuantity ?? 0),
    lowStockThreshold: Number(data.lowStockThreshold ?? 5),
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    imagePath: data.imagePath ? String(data.imagePath) : undefined,
    isActive: data.isActive !== false,
    storeId: String(data.storeId ?? STORE_ID),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
  }
}

export async function listProducts(storeId = STORE_ID): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    orderBy('name'),
  )
  try {
    const snap = await getDocs(q)
    return snap.docs.map(mapProduct)
  } catch {
    // Fallback if composite index is missing — still works, sorted client-side
    const snap = await getDocs(
      query(collection(db, 'products'), where('storeId', '==', storeId)),
    )
    return snap.docs
      .map(mapProduct)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }
}

export async function findProductByBarcode(
  barcode: string,
  storeId = STORE_ID,
): Promise<Product | null> {
  const trimmed = barcode.trim()
  if (!trimmed) return null
  const q = query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    where('barcode', '==', trimmed),
    where('isActive', '==', true),
    limit(1),
  )
  try {
    const snap = await getDocs(q)
    if (snap.empty) return null
    return mapProduct(snap.docs[0]!)
  } catch {
    const snap = await getDocs(
      query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('barcode', '==', trimmed),
        limit(5),
      ),
    )
    const match = snap.docs.map(mapProduct).find((p) => p.isActive)
    return match ?? null
  }
}

export function allocateProductId(): string {
  return doc(collection(db, 'products')).id
}

export async function createProduct(
  input: Omit<Product, 'id'> & { createdBy?: string },
  productId?: string,
): Promise<string> {
  const ref = productId
    ? doc(db, 'products', productId)
    : doc(collection(db, 'products'))
  await setDoc(ref, {
    name: input.name,
    sku: input.sku,
    barcode: input.barcode.trim(),
    category: input.category,
    brand: input.brand ?? null,
    supplierId: input.supplierId ?? null,
    description: input.description ?? null,
    unit: input.unit ?? 'each',
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    stockQuantity: input.stockQuantity,
    lowStockThreshold: input.lowStockThreshold,
    imageUrl: input.imageUrl ?? null,
    imagePath: input.imagePath ?? null,
    isActive: input.isActive,
    storeId: input.storeId,
    createdBy: input.createdBy ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(
  productId: string,
  input: Omit<Partial<Omit<Product, 'id'>>, 'imageUrl' | 'imagePath' | 'supplierId' | 'brand' | 'description'> & {
    storeId: string
    imageUrl?: string | null
    imagePath?: string | null
    supplierId?: string | null
    brand?: string | null
    description?: string | null
  },
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  const keys = [
    'name',
    'sku',
    'barcode',
    'category',
    'brand',
    'supplierId',
    'description',
    'unit',
    'costPrice',
    'sellingPrice',
    'stockQuantity',
    'lowStockThreshold',
    'imageUrl',
    'imagePath',
    'isActive',
  ] as const

  for (const key of keys) {
    if (key in input && input[key] !== undefined) {
      payload[key] = input[key] ?? null
    }
  }

  if (typeof payload.barcode === 'string') {
    payload.barcode = payload.barcode.trim()
  }

  await updateDoc(doc(db, 'products', productId), payload)
}

export function generateStoreBarcode(): string {
  // Store-assigned EAN-13 style code (2 + 11 digits). Check digit not enforced for internal use.
  const stamp = Date.now().toString().slice(-10)
  const rand = Math.floor(Math.random() * 90 + 10).toString()
  return `2${stamp}${rand}`.slice(0, 13)
}
