# Phase 5: B2C Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 05-B2C-Experience
**Areas discussed:** Order History, Review System, Address Management, Real-Time Updates

---

## Order History Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Real-time | Fetch orders directly from `order-service` | ✓ |
| Synced | Keep a local copy in `auth-service` | |

**User's choice:** real-time
**Notes:** Preferred for data consistency and simplicity.

---

## Review System Architecture
| Option | Description | Selected |
|--------|-------------|----------|
| Product-Service | Module inside product service | ✓ |
| Social-Service | Standalone service | |

**User's choice:** product-service different module with verified
**Notes:** Reviews must be gated by verified purchases (linked to order history).

---

## Address Management
| Option | Description | Selected |
|--------|-------------|----------|
| Single Fixed | One address, editable | ✓ |
| Multi-Address | Full list support | |

**User's choice:** one fix address and can be edited later
**Notes:** Simplified from the original roadmap requirement to prioritize delivery.

---

## Real-Time Status Updates
| Option | Description | Selected |
|--------|-------------|----------|
| Standard | Page refresh / polling | ✓ |
| Push | WebSockets (Socket.io) | |

**User's choice:** standard page refreshing
**Notes:** Polling/refresh is sufficient for V1; WebSocket overhead not required yet.

---

## Deferred Ideas
- Multi-address list management (moved to future backlog).
- Real-time status push notifications via Socket.io.
