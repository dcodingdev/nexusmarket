# NexusMarket

## What This Is

NexusMarket is a full-stack, multi-vendor e-commerce platform designed to connect independent sellers with global customers through a unified, high-performance marketplace. It features three dedicated frontend portals—Customer Storefront, Vendor Dashboard, and Admin Oversight—interacting seamlessly with a robust backend microservices architecture to handle real-time inventory, complex order states, and automated revenue splitting.

## Core Value

To provide a frictionless, real-time marketplace experience where customers can effortlessly discover and purchase products, and vendors can manage their operations and payouts with complete transparency.

## Current Milestone: v2.0 "Scale & Polish"

**Goal**: Transform the core functional platform into a production-hardened, high-traffic marketplace with robust B2C features and resilient infrastructure.

**Target features**:
- **Auth & RBAC**: Full registration/login flows and Role-Based Access Control logic on the frontend.
- **Customer Portal**: Account dashboards, order history, address management, and product reviews.
- **Vendor Financials**: Advanced earnings tracking, commission calculation, and payout scheduling.
- **Discovery Polish**: Faceted search, filtering, and infinite scroll storefront UX.
- **Infrastructure**: API Gateway rate limiting (WAF) and MongoDB Read Replicas for discovery scaling.

## Requirements

### Validated (v1.0 Accomplishments)

- ✓ **Multi-vendor Foundation** — Core storefront discovery and masonry grid.
- ✓ **Unified Checkout** — Stripe-integrated multi-vendor checkout with stock locking.
- ✓ **Vendor Operations** — Inventory CRUD and drag-and-drop media uploads.
- ✓ **Real-time Chat** — Socket.io communication between customers and vendors.
- ✓ **Admin Oversight** — Global moderation portal for users and products.

### Active (v2.0 Scope)

- [ ] **RBAC & Auth Flows** — Registration, Login, and frontend route protection based on user roles.
- [ ] **Customer Account Suite** — Order tracking history, address book management, and user profiles.
- [ ] **Product Reviews** — System for customers to rate and review purchased products.
- [ ] **Financial Payouts** — Automated earnings calculations and payout status timelines for vendors.
- [ ] **Advanced Filtering** — Category-specific facets (e.g., size, color, brand) in the storefront.
- [ ] **Infinite Scroll UX** — Replacing standard pagination with a seamless masonry infinite grid.
- [ ] **Rate Limiting & WAF** — API Gateway protection against DDoS and scraping.
- [ ] **Read Replicas** — Offloading search/discovery queries to MongoDB Read Replicas.

### Out of Scope

- [Mobile Native Apps] — Focusing on PWA and responsive web for this milestone.
- [Custom Logistics Network] — Continuing to rely on external shipping providers.

## Context

- **Milestone v1.0 Outcome**: Successfully established the "Happy Path" from product upload to checkout and real-time chat.
- **Backend Status**: Backend services are being extended to support RBAC and Read Replicas.
- **Architecture**: Continuing with the Turborepo microservices pattern.

## Constraints

- **RBAC Alignment**: Frontend RBAC logic must strictly mirror the `auth-service` middleware permissions.
- **Performance**: Search/Discovery latency must remain below 100ms using Read Replicas.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Read Replicas for Search | High discovery traffic shouldn't impact write performance for orders/payments. | — Pending |
| API Gateway Rate Limiting | Protect microservices from automated scraping and abuse. | — Pending |
| Frontend-driven RBAC | Reduce unnecessary backend requests for simple UI permission checks. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 for Milestone v2.0*
