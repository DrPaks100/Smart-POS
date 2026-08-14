export const STORE_ID = 'best-brightness-main'

export const DEFAULT_TAX_RATE = 0.15

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
} as const

/** Public portfolio demo logins — shown on the sign-in page. */
export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Admin',
    hint: 'Full shop · staff & settings',
    email: 'admin@bestbrightness.co.za',
    password: 'BestBright@Admin2026!',
    displayName: 'Best Brightness Admin',
  },
  {
    role: 'manager' as const,
    label: 'Manager',
    hint: 'Floor · stock & reports',
    email: 'manager@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Sipho Manager',
  },
  {
    role: 'cashier' as const,
    label: 'Cashier',
    hint: 'Till · scan & sell',
    email: 'cashier@bestbrightness.co.za',
    password: 'DemoTill@2026',
    displayName: 'Lerato Cashier',
  },
] as const

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
