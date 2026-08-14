import { create } from 'zustand'
import type { CartLineItem, PaymentMethod } from '@/types'
import { DEFAULT_TAX_RATE } from '@/constants'

interface CartState {
  items: CartLineItem[]
  discountPercent: number
  taxRate: number
  paymentMethod: PaymentMethod
  addOrIncrement: (item: Omit<CartLineItem, 'quantity' | 'discount' | 'lineTotal'> & { quantity?: number }) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  setDiscountPercent: (value: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  clear: () => void
  subtotal: () => number
  discountAmount: () => number
  taxAmount: () => number
  total: () => number
}

function recalc(item: CartLineItem): CartLineItem {
  const lineTotal = Math.max(0, item.unitPrice * item.quantity - item.discount)
  return { ...item, lineTotal }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountPercent: 0,
  taxRate: DEFAULT_TAX_RATE,
  paymentMethod: 'cash',

  addOrIncrement: (incoming) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === incoming.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === incoming.productId
              ? recalc({ ...i, quantity: i.quantity + (incoming.quantity ?? 1) })
              : i,
          ),
        }
      }
      const quantity = incoming.quantity ?? 1
      return {
        items: [
          ...state.items,
          recalc({
            ...incoming,
            quantity,
            discount: 0,
            lineTotal: 0,
          }),
        ],
      }
    })
  },

  setQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? recalc({ ...i, quantity }) : i,
      ),
    }))
  },

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  setDiscountPercent: (value) => set({ discountPercent: Math.min(100, Math.max(0, value)) }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clear: () => set({ items: [], discountPercent: 0, paymentMethod: 'cash' }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),

  discountAmount: () => (get().subtotal() * get().discountPercent) / 100,

  taxAmount: () => {
    const taxable = get().subtotal() - get().discountAmount()
    return taxable * get().taxRate
  },

  total: () => get().subtotal() - get().discountAmount() + get().taxAmount(),
}))
