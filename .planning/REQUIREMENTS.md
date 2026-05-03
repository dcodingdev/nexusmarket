# NexusMarket v2.0 Requirements

## 1. Auth & RBAC (AUTH)

- [ ] **AUTH-01**: User Registration & Login pages (Storefront) integrated with `auth-service`.
- [ ] **AUTH-02**: Frontend RBAC logic to restrict access to portals (Customer, Vendor, Admin) based on JWT roles.
- [ ] **AUTH-03**: Secure Token Refresh mechanism on the frontend to maintain active sessions.
- [ ] **AUTH-04**: Role-based Navigation: Hide/Show UI elements (e.g., "Vendor Dashboard" link) based on permissions.

## 2. Customer Experience (CUST)

- [ ] **CUST-01**: Unified Customer Dashboard for managing profile and settings.
- [ ] **CUST-02**: Order History page with detailed status and historical tracking.
- [ ] **CUST-03**: Address Book management (Multiple shipping/billing addresses).
- [ ] **CUST-04**: Product Review system: Customers can leave star ratings and text feedback after delivery.

## 3. Vendor Financials (VEND)

- [ ] **VEND-01**: Earnings Dashboard: Real-time visualization of Gross Sales vs. Net Earnings.
- [ ] **VEND-02**: Commission Breakdown: Display platform fees per transaction.
- [ ] **VEND-03**: Payout Schedule: Timeline of upcoming funds release according to the 7-day clearing policy.
- [ ] **VEND-04**: Withdrawal History: Log of all past payouts and their status.

## 4. Discovery Polish (DISC)

- [ ] **DISC-01**: Faceted Filtering: Sidebar with dynamic filters for categories, price ranges, and product attributes.
- [ ] **DISC-02**: Search Autocomplete: Real-time suggestions in the global search bar.
- [ ] **DISC-03**: Infinite Scroll Masonry: Smooth loading of products as the user scrolls, replacing traditional pagination.
- [ ] **DISC-04**: Search Results Sorting: Price (Low/High), Newest, and Popularity.

## 5. Infrastructure & Performance (PERF)

- [ ] **PERF-01**: API Gateway Rate Limiting: Global policy to prevent DDoS and automated scraping (Nginx/Gateway).
- [ ] **PERF-02**: MongoDB Read Replicas: Configure search and discovery queries to hit secondary instances.
- [ ] **PERF-03**: Caching Layer: Implement Redis caching for high-traffic product catalog pages.

## Traceability

| REQ-ID | Phase | Success Criteria |
|--------|-------|------------------|
| AUTH-01| 4.1   | User can register and login successfully. |
| AUTH-02| 4.1   | Unauthorized roles are redirected from protected portals. |
| AUTH-03| 4.1   | Session remains active without logout during inactivity. |
| AUTH-04| 4.1   | Sidebar links vary based on user role. |
| CUST-01| 5.1   | Dashboard displays correct user profile data. |
| CUST-02| 5.1   | List of previous orders is accurate and clickable. |
| CUST-03| 5.2   | User can add/edit/delete shipping addresses. |
| CUST-04| 5.2   | Star ratings appear on product pages after submission. |
| VEND-01| 6.1   | Earnings chart matches backend transaction logs. |
| VEND-02| 6.1   | Each sale shows a clear platform fee deduction. |
| VEND-03| 6.2   | Upcoming payouts are visible with release dates. |
| VEND-04| 6.2   | Searchable log of past withdrawals is available. |
| DISC-01| 7.1   | Filtering by price/category updates the product grid. |
| DISC-02| 7.1   | Search bar shows 3-5 suggestions as user types. |
| DISC-03| 7.2   | No "Load More" button; new items appear on scroll. |
| DISC-04| 7.1   | Products reorder immediately when sort is changed. |
| PERF-01| 8.1   | API returns 429 after 100 requests/min from one IP. |
| PERF-02| 7.2   | Discovery queries show "secondary" in mongo logs. |
| PERF-03| 7.2   | Product page load time < 50ms for cached items. |

---
*Generated: 2026-05-03*
