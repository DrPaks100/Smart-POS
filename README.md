# Best Brightness Smart POS

Commercial retail point-of-sale for Best Brightness (South Africa) — cleaning, kitchen, and household.

## Live app

- https://best-brightness-pos.web.app
- https://best-brightness-pos.firebaseapp.com

## Stack

React · TypeScript · Vite · Firebase (Auth, Firestore) · Tailwind · Zustand · TanStack Query · Framer Motion

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full system including Staff and Settings |
| **Manager** | Dashboard, POS, Products, Inventory, Customers, Suppliers, Reports |
| **Cashier** | Dashboard, POS, Customers |

Staff (managers and cashiers) are registered by an administrator under **Staff**.

## Local development

```bash
npm install
cp .env.example .env   # fill Firebase web config
npm run dev
```

## Build & deploy

```bash
npm run build
npx firebase-tools@latest deploy --only hosting,firestore:rules
```

## Notes

- Product photos are stored as compressed data URLs on product documents (no Firebase Storage required).
- Card payments are a UI simulation for portfolio demos — not live Stripe charges.
- Currency: ZAR (R). VAT default 15%. Bright Club discount comes from Settings.
