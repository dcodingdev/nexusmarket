# Phase 5: B2C Experience - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the core customer dashboard and self-service capabilities, including order tracking, address management, and verified product reviews.

</domain>

<decisions>
## Implementation Decisions

### Order History & Status
- **D-01:** Order history will be fetched in real-time from the `order-service` via API/Middleware rather than syncing a summary to the user profile.
- **D-02:** Order status updates (e.g., 'Shipped') will be handled via standard page refreshing/polling rather than WebSockets.

### Review System (Product Service Integration)
- **D-03:** Reviews will be managed within the `product-service` as a distinct module rather than a standalone service.
- **D-04:** Verified Purchaser Enforcement: Reviews are only permitted for users who have a completed order for that specific product in the `order-service`.

### Profile & Address Management
- **D-05:** Single Address Model: The user profile will support one fixed primary address (can be edited/updated later) rather than a complex multi-address list.
- **D-06:** Dashboard Hub: Create a centralized "My Account" area in `apps/web` (under `/(store)/account`) to house these features.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Platform
- `.planning/PROJECT.md` — Project goals and scale parameters.
- `.planning/REQUIREMENTS.md` — B2C traceability requirements (CUST-01 to CUST-04).
- `.planning/ROADMAP.md` — Phase 5 milestones and deliverables.

### Domain Specs
- `services/order-service/src/modules/order.model.ts` — Order schema for history mapping.
- `services/auth-service/src/modules/users/user.model.ts` — User schema for address integration.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAuthStore` (Zustand): To manage the local user state and address updates.
- `AuthGuard` / `RoleGuard`: To protect the `/(store)/account` routes for customers.

### Established Patterns
- **API Interceptors**: Pattern used in `apps/web/src/lib/auth.ts` should be extended for `order-service` calls.
- **Premium UI**: Maintain the "Scale & Polish" aesthetic (vibrant colors, smooth transitions) used in Phase 4.

### Integration Points
- `apps/web/src/app/(store)/account/` — New route group for customer portal.
- `services/product-service/src/modules/reviews/` — New module for the review system.

</code_context>

<specifics>
## Specific Ideas
- "One fix address and can be edited later" — Simplicity for V1.
- "Verified Purchaser" — High trust reviews.

</specifics>

<deferred>
## Deferred Ideas
- **Multi-Address Management**: Support for multiple shipping/billing addresses (Originally in ROADMAP, deferred to V2.1 by user preference).
- **Real-time Order Notifications**: Socket.io integration for status updates.

</deferred>

---

*Phase: 05-B2C-Experience*
*Context gathered: 2026-05-03*
