# Best Brightness Smart POS

Commercial retail point-of-sale for Best Brightness (South Africa) — cleaning, kitchen, and household.

## Live app

- **GitHub Pages:** https://drpaks100.github.io/Smart-POS/
- **Repo:** https://github.com/DrPaks100/Smart-POS
- Firebase Hosting (`.web.app`) can be enabled after Firebase CLI re-login / Hosting site setup.

## Stack

React · TypeScript · Vite · Firebase (Auth, Firestore) · Tailwind · Zustand · TanStack Query · Framer Motion

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full system including Staff and Settings |
| **Manager** | Dashboard, POS, Products, Inventory, Customers, Suppliers, Reports |
| **Cashier** | Dashboard, POS, Customers |

Staff (managers and cashiers) are registered by an administrator under **Staff**.

## Demo logins

This is a live portfolio demo. Visitors can tap a role on the login page or sign in with:

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@bestbrightness.co.za` | `BestBright@Admin2026!` |
| Manager | `manager@bestbrightness.co.za` | `DemoTill@2026` |
| Cashier | `cashier@bestbrightness.co.za` | `DemoTill@2026` |

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
