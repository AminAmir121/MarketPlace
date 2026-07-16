# Marketplace Project Plan

> Saved from planning session — build **component-wise**, one piece at a time.

## Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js, Redux          |
| Backend  | Node.js, Express        |
| Database | MongoDB                 |

## Roles (3)

### 1. Customer
- Browse home page (products from all stores)
- Register / login (account created on signup)
- Mark favorites
- Place orders
- Option to **create a store** (becomes vendor)

### 2. Vendor
- Gets a store when they create one
- Post product ads (listings)
- **Vendor portal:**
  - Add / edit / delete product ads
  - View customer orders
  - Store analytics

### 3. Admin (site owner)
- **Admin portal:**
  - View all users
  - View all stores
  - Delete stores
  - See reports from vendors and customers

## User Flows

```
Home (public)
  └── Products from different stores displayed

Login / Register
  └── Customer: favorites, orders, create store

Create Store
  └── Vendor portal: ads, orders, analytics

Admin portal
  └── Full platform control
```

## Pages / Areas (high level)

| Area           | Purpose                                      |
|----------------|----------------------------------------------|
| Home           | Marketplace feed — all store products        |
| Auth           | Login, register                              |
| Customer       | Favorites, orders, create store              |
| Vendor portal  | Product CRUD, orders, analytics              |
| Admin portal   | Users, stores, moderation, reports           |

## Build Approach

- **Component-wise** — implement one component/feature at a time
- Do not rush full pages; ship small, working pieces
- Frontend: `Ecom/marketplace` (Next.js)
- Backend: to be added under `Ecom/` (Node + Express + MongoDB)

## Notes

- Multi-vendor marketplace (Etsy / Amazon Marketplace style)
- Same user can be customer and vendor (after creating a store)
- Admin is separate role (site owner)
