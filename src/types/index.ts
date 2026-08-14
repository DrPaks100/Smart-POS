export type UserRole = 'admin' | 'manager' | 'cashier'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  phone?: string
  isActive: boolean
  storeId: string
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date
}

export type PaymentMethod = 'cash' | 'card' | 'eft'

export type SaleStatus = 'completed' | 'cancelled' | 'suspended'

export interface CartLineItem {
  productId: string
  name: string
  barcode: string
  quantity: number
  unitPrice: number
  costPrice: number
  discount: number
  lineTotal: number
  imageUrl?: string
  imagePath?: string
}

export interface SaleLineItem {
  productId: string
  name: string
  barcode: string
  quantity: number
  unitPrice: number
  costPrice: number
  lineTotal: number
  imageUrl?: string
  imagePath?: string
}

export interface Sale {
  id: string
  storeId: string
  items: SaleLineItem[]
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
  status: SaleStatus
  amountTendered?: number
  changeGiven?: number
  createdAt?: Date
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  brand?: string
  supplierId?: string
  description?: string
  unit?: string
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  lowStockThreshold: number
  imageUrl?: string
  imagePath?: string
  isActive: boolean
  storeId: string
  createdBy?: string
}

export type InventoryAdjustType = 'receive' | 'remove' | 'set'

export interface InventoryLog {
  id: string
  storeId: string
  productId: string
  productName: string
  type: InventoryAdjustType
  quantityBefore: number
  quantityAfter: number
  delta: number
  reason: string
  userId: string
  userName: string
  createdAt?: Date
}

export interface Customer {
  id: string
  storeId: string
  name: string
  phone?: string
  email?: string
  memberCard?: string
  notes?: string
  isActive: boolean
  visits: number
  totalSpent: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Supplier {
  id: string
  storeId: string
  name: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type ThemeId = 'brand' | 'dark' | 'ocean' | 'sunset'

export interface StoreSettings {
  id: string
  storeId: string
  storeName: string
  phone?: string
  email?: string
  address?: string
  vatPercent: number
  clubDiscountPercent: number
  themeId: ThemeId
  currency: 'ZAR'
  updatedAt?: Date
}

export type SpeedpointPhase =
  | 'idle'
  | 'waiting_card'
  | 'reading'
  | 'authorizing'
  | 'approved'
  | 'declined'
  | 'cancelled'
