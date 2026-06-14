# NexusMarket

**Production multi-vendor e-commerce platform — microservices, real-time inventory, live chat, and PPP-aware payments.**

[![Live](https://img.shields.io/badge/status-live%20v1.0-brightgreen)](https://nexusmarket.vercel.app)
[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%C2%B7%20Node.js%20%C2%B7%20MongoDB%20%C2%B7%20RabbitMQ-blue)](#tech-stack)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

---

## What Is This

NexusMarket lets customers browse and buy from multiple vendors in a single checkout. Vendors manage their own inventory, listings, and fulfillment. Admins moderate the marketplace.

Three role-based portals. Five independent services. One monorepo.

---

## Architecture

```
                        ┌─────────────────────────────────┐
                        │          Nginx API Gateway        │
                        └────────────────┬────────────────┘
                                         │
          ┌──────────────┬───────────────┼───────────────┬──────────────┐
          ▼              ▼               ▼               ▼              ▼
    Auth Service   Product Service  Order Service  Payment Service  Chat Service
    (JWT + RBAC)   (ImageKit CDN)   (Stock Lock)   (Stripe)       (Socket.IO)
          │              │               │               │              │
          └──────────────┴───────────────┴───────────────┴──────────────┘
                                         │
                              ┌──────────┴──────────┐
                              │      RabbitMQ        │
                              │  (async event bus)   │
                              └─────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         │         MongoDB Atlas          │
                         │    Redis (chat session cache)  │
                         └───────────────────────────────┘
```

**Monorepo layout (Turborepo / pnpm)**

```
apps/
  web/          → Next.js 16 storefront (Vercel)
  vendor/       → Vendor dashboard (Vercel)
  admin/        → Admin portal (Vercel)
services/
  auth/         → JWT auth + token refresh
  product/      → Listings, media, inventory CRUD
  order/        → Cart, checkout orchestration, stock locking
  payment/      → Stripe Checkout, PPP engine, webhook handler
  chat/         → Socket.IO + Redis real-time messaging
packages/
  api-contracts/
  database/
  logger/
  rabbitmq/
  types/
  image-storage/
  config/
```

---

## Key Features

### Event-Driven Stock Locking
No overselling. Inventory locked the moment an order is created, not when payment clears.

```
order.created   →  reservedQuantity++
payment.success →  actualQuantity--, order.status = PAID
order.cancelled →  reservedQuantity-- (reservation released)
```

### Purchasing Power Parity Engine
Price adjusts to buyer's region before Stripe session is created.

```
Edge Middleware (Next.js) → detect country via IP headers
                          ↓
Payment Service PPP middleware → calculate regional multiplier
                          ↓
Stripe Checkout session → adjusted final amount
```

### Real-Time B2C Chat
Buyers and sellers message directly. Socket.IO rooms per conversation, Redis-backed session cache for low-latency retrieval.

### Multi-Vendor Checkout
Single cart across multiple vendor products. One Stripe session. Order Service fans out per-vendor fulfillment records after payment confirmation.

### Infrastructure as Code
Entire backend provisioned via `render.yaml` — 5 services + Nginx gateway + managed Redis. One-click deploy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas |
| Cache | Redis |
| Message Bus | RabbitMQ |
| Payments | Stripe Checkout |
| Media CDN | ImageKit |
| Auth | JWT (access + refresh), bcrypt, RBAC |
| Real-Time | Socket.IO |
| Containerization | Docker (multi-stage builds) |
| Gateway | Nginx |
| Frontend Deploy | Vercel (edge, global CDN) |
| Backend Deploy | Render Blueprint |
| Monorepo | Turborepo + pnpm workspaces |

---

## Role-Based Portals

| Portal | Who | What They Can Do |
|---|---|---|
| Customer Storefront | Buyers | Browse (infinite scroll masonry), cart, checkout, live chat |
| Vendor Dashboard | Sellers | Listing CRUD, drag-and-drop media uploads, fulfillment/shipping status |
| Admin Portal | Platform ops | User moderation, product moderation, marketplace metrics |

---

## Local Development

**Prerequisites:** Node.js 20+, pnpm 9+, Docker, MongoDB Atlas URI, Redis, RabbitMQ

```bash
# Clone
git clone https://github.com/dcodingdev/nexusmarket.git
cd nexusmarket

# Install all workspace dependencies
pnpm install

# Copy and fill environment variables
cp .env.example .env

# Start all services (Docker)
docker-compose up --build

# Or run dev servers directly
pnpm dev
```

**Required env vars**

```env
MONGODB_URI=
REDIS_URL=
RABBITMQ_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

---

## Deployment

**Backend → Render**

```bash
# render.yaml provisions:
# - 5 microservices
# - Nginx API gateway
# - Managed Redis instance
render deploy
```

**Frontend → Vercel**

```bash
vercel --prod
```




