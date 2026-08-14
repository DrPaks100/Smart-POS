export const STORE_ID = 'best-brightness-main'

export const DEFAULT_TAX_RATE = 0.15

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
} as const

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'manager', 'cashier'] },
  { to: '/pos', label: 'Point of Sale', roles: ['admin', 'manager', 'cashier'] },
  { to: '/products', label: 'Products', roles: ['admin', 'manager'] },
  { to: '/inventory', label: 'Inventory', roles: ['admin', 'manager'] },
  { to: '/customers', label: 'Customers', roles: ['admin', 'manager', 'cashier'] },
  { to: '/suppliers', label: 'Suppliers', roles: ['admin', 'manager'] },
  { to: '/reports', label: 'Reports', roles: ['admin', 'manager'] },
  { to: '/staff', label: 'Staff', roles: ['admin'] },
  { to: '/settings', label: 'Settings', roles: ['admin'] },
] as const
