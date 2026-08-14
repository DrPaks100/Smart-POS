export const STORE_ID = 'best-brightness-main'

export const DEFAULT_TAX_RATE = 0.15

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
} as const

/** Staff access shown on the sign-in page. */
export const STAFF_ACCESS = [
  {
    role: 'admin' as const,
    label: 'Admin',
    hint: 'Full shop',
    email: 'admin@bestbrightness.co.za',
    password: 'BestBright@Admin2026!',
    displayName: 'Best Brightness Admin',
  },
  {
    role: 'manager' as const,
    label: 'Manager',
    hint: 'Floor & stock',
    email: 'manager@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Sipho Manager',
  },
  {
    role: 'cashier' as const,
    label: 'Cashier',
    hint: 'Till',
    email: 'cashier@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Lerato Cashier',
  },
] as const

/** @deprecated Use STAFF_ACCESS */
export const DEMO_ACCOUNTS = STAFF_ACCESS

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
