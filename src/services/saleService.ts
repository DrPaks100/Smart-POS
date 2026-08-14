import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { STORE_ID } from '@/constants'
import type { CartLineItem, PaymentMethod, Sale, SaleLineItem } from '@/types'

function mapSale(snap: QueryDocumentSnapshot<DocumentData>): Sale {
  const data = snap.data()
  const created = data.createdAt as Timestamp | undefined
  return {
    id: snap.id,
    storeId: String(data.storeId ?? STORE_ID),
    items: Array.isArray(data.items)
      ? (data.items as SaleLineItem[]).map((item) => ({
          productId: String(item.productId ?? ''),
          name: String(item.name ?? ''),
          barcode: String(item.barcode ?? ''),
          quantity: Number(item.quantity ?? 0),
          unitPrice: Number(item.unitPrice ?? 0),
          costPrice: Number(item.costPrice ?? 0),
          lineTotal: Number(item.lineTotal ?? 0),
          imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
          imagePath: item.imagePath ? String(item.imagePath) : undefined,
        }))
      : [],
    subtotal: Number(data.subtotal ?? 0),
    discountPercent: Number(data.discountPercent ?? 0),
    discountAmount: Number(data.discountAmount ?? 0),
    taxAmount: Number(data.taxAmount ?? 0),
    total: Number(data.total ?? 0),
    paymentMethod: (data.paymentMethod as PaymentMethod) ?? 'cash',
    paymentRef: data.paymentRef ? String(data.paymentRef) : undefined,
    memberCard: data.memberCard ? String(data.memberCard) : null,
    cashierId: String(data.cashierId ?? ''),
    cashierName: String(data.cashierName ?? ''),
    status: data.status === 'cancelled' || data.status === 'suspended' ? data.status : 'completed',
    amountTendered: data.amountTendered != null ? Number(data.amountTendered) : undefined,
    changeGiven: data.changeGiven != null ? Number(data.changeGiven) : undefined,
    createdAt: created?.toDate?.() ?? undefined,
  }
}

export async function completeSale(input: {
  storeId?: string
  items: CartLineItem[]
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxAmount: number
  total: number
  paymentMethod: PaymentMethod
  paymentRef?: string
  memberCard?: string | null
  cashierId: string
  cashierName: string
  amountTendered?: number
  changeGiven?: number
}): Promise<string> {
  if (input.items.length === 0) {
    throw new Error('Cart is empty.')
  }

  const storeId = input.storeId ?? STORE_ID
  const saleRef = doc(collection(db, 'sales'))
  const batch = writeBatch(db)

  batch.set(saleRef, {
    storeId,
    items: input.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      barcode: item.barcode,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice,
      lineTotal: item.lineTotal,
      imageUrl: item.imageUrl?.startsWith('data:') ? null : item.imageUrl ?? null,
      imagePath: null,
    })),
    subtotal: input.subtotal,
    discountPercent: input.discountPercent,
    discountAmount: input.discountAmount,
    taxAmount: input.taxAmount,
    total: input.total,
    paymentMethod: input.paymentMethod,
    paymentRef: input.paymentRef ?? null,
    memberCard: input.memberCard ?? null,
    cashierId: input.cashierId,
    cashierName: input.cashierName,
    status: 'completed',
    amountTendered: input.amountTendered ?? null,
    changeGiven: input.changeGiven ?? null,
    createdAt: serverTimestamp(),
  })

  for (const item of input.items) {
    batch.update(doc(db, 'products', item.productId), {
      stockQuantity: increment(-item.quantity),
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
  return saleRef.id
}

export async function listSales(storeId = STORE_ID, take = 40): Promise<Sale[]> {
  const base = collection(db, 'sales')
  try {
    const snap = await getDocs(
      query(base, where('storeId', '==', storeId), orderBy('createdAt', 'desc'), limit(take)),
    )
    return snap.docs.map(mapSale)
  } catch {
    const snap = await getDocs(query(base, where('storeId', '==', storeId), limit(80)))
    return snap.docs
      .map(mapSale)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, take)
  }
}
