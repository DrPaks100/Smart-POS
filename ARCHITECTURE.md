# Architecture — Best Brightness Smart POS

## Overview

Client SPA (Vite + React) talking to Firebase BaaS. UI never imports Firestore SDK directly outside services.

```
Presentation (pages / features / components)
        ↓
App state (Zustand) + server cache (TanStack Query)
        ↓
Services (auth, products, sales, storage…)
        ↓
Firebase (Auth · Firestore · Storage)
```

## Folder structure

```
src/
  app/                 # Router, providers, App shell wiring
  components/          # Shared UI + layout
    ui/
    layout/
  features/            # Domain features
    auth/
    dashboard/
    products/
    inventory/
    customers/
    suppliers/
    sales/             # POS
    reports/
    settings/
  hooks/
  services/
  firebase/
  stores/
  types/
  utils/
  assets/
  styles/
```

## Data (Firestore)

Collections: `users`, `products`, `categories`, `customers`, `sales`, `suppliers`, `purchase_orders`, `inventory_logs`, `settings`, `notifications`, `expenses`, `suspended_sales`, `reports`

Every business doc includes `storeId` for future multi-tenant SaaS.

## AuthZ

1. UI route + nav gates by role  
2. Firestore / Storage security rules  
3. Future: custom claims via Cloud Functions  

## Storage

Upload → Storage path → `downloadURL` → persist URL on product/customer docs. Never store image binary in Firestore.

## State

- Zustand: cart, auth session UI, POS session  
- TanStack Query: server entities (products, sales lists)  
- React Hook Form + Zod: forms  

## Deployment target

Firebase Hosting + Firestore + Auth + Storage (South Africa–friendly region when provisioning).
