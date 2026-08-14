# Project Specification — Best Brightness Smart POS

## Vision

A commercial-grade cloud POS and retail OS that feels luxurious, runs fast, and scales from a single store to multi-location operations.

## Business domain

Best Brightness sells cleaning products, kitchen utensils, household goods, plasticware, and home accessories.

## Users & roles

| Role | Access |
| --- | --- |
| Administrator | Full system, users, settings, all reports |
| Manager | Products, inventory, customers, suppliers, reports, POS |
| Cashier | POS, customers (scoped), own sales |

Authentication: Firebase email/password. No public self-registration in production.

## Modules

1. Auth (login, forgot password, RBAC)
2. Dashboard (KPIs, charts, low stock, recent sales)
3. Products (CRUD, images via Storage, barcode, categories)
4. POS (scan, cart, tax, discount, cash/card/EFT, Speedpoint sim, receipts)
5. Customers
6. Suppliers & purchase orders
7. Inventory (in/out/adjust + logs)
8. Reports (sales, profit, top products, cashier performance)
9. Settings (store, tax, receipt, users, permissions)

## Non-functional

- Production TypeScript, feature architecture
- Sub-200ms perceived POS interactions where possible
- Accessibility: keyboard, focus, ARIA, contrast
- Firestore security rules + Storage rules
- Images only in Firebase Storage; URLs in Firestore

## Success criteria

Every screen must feel sellable to thousands of retail businesses. If it looks like a template, redesign.
