# Phase 4 Plan: Identity & Security

**Goal**: Secure the platform with full authentication and Role-Based Access Control (RBAC).

**Requirements**:
- AUTH-01: User Registration & Login pages (Storefront) integrated with `auth-service`.
- AUTH-02: Frontend RBAC logic to restrict access to portals based on JWT roles.
- AUTH-03: Secure Token Refresh mechanism.
- AUTH-04: Role-based Navigation.

---

## Wave 1: Frontend Auth Engine

### Task 1: Create Auth Library & Client
- **File**: `apps/web/src/lib/auth.ts`
- **Action**: Implement a client that handles `login`, `register`, and `refresh` requests to `auth-service`.
- **Read First**: `services/auth-service/src/modules/auth/auth.controller.ts` (for endpoint specs).
- **Acceptance Criteria**:
  - Contains `login(credentials)`, `register(data)`, and `refreshToken()` methods.
  - Handles `credentials: 'include'` for HttpOnly cookies.

### Task 2: Implement Auth Context & Provider
- **File**: `apps/web/src/context/AuthContext.tsx`
- **Action**: Create a context to store the current `user` and `isAuthenticated` status.
- **Acceptance Criteria**:
  - `AuthProvider` wraps the root layout.
  - Exposes `login`, `logout`, and `user` object.

### Task 3: Create useAuth Hook
- **File**: `apps/web/src/hooks/useAuth.ts`
- **Action**: Export a hook that provides access to the `AuthContext`.
- **Acceptance Criteria**:
  - Returns `{ user, isAuthenticated, login, logout, role }`.

---

## Wave 2: Protected Routes & RBAC

### Task 1: Next.js Middleware for Role-Based Redirects
- **File**: `apps/web/middleware.ts`
- **Action**: Implement middleware that checks the `refreshToken` (or a proxy role cookie) to redirect unauthorized users.
- **Read First**: `04-CONTEXT.md` (RBAC Strategy section).
- **Acceptance Criteria**:
  - Redirects users from `/(vendor)/*` if role is not `vendor`.
  - Redirects users from `/(admin)/*` if role is not `admin`.
  - Handles "404 Masking" for `/admin` as per context.

### Task 2: Layout Portal Guards
- **Files**: 
  - `apps/web/src/app/(vendor)/layout.tsx`
  - `apps/web/src/app/(admin)/layout.tsx`
- **Action**: Wrap the portal layouts with a `RoleGuard` component.
- **Acceptance Criteria**:
  - `(vendor)` layout renders an "Upgrade to Vendor" landing page if the user is a `customer`.
  - `(admin)` layout returns `notFound()` if the user is not an `admin`.

---

## Wave 3: Auth UI & Onboarding

### Task 1: Customer Login & Registration Pages
- **Files**:
  - `apps/web/src/app/(store)/login/page.tsx`
  - `apps/web/src/app/(store)/register/page.tsx`
- **Action**: Build standard email/password forms using React Hook Form and Zod.
- **Acceptance Criteria**:
  - Success redirects to the home page.
  - Error states displayed (e.g., "Invalid credentials").

### Task 2: Vendor Onboarding Wizard
- **File**: `apps/web/src/app/(store)/register/vendor/page.tsx`
- **Action**: Create a multi-step form for Vendor registration.
- **Acceptance Criteria**:
  - Step 1: Basic Account (Email, Password).
  - Step 2: Shop Details (Shop Name, Description).
  - Step 3: Business Details (Tax ID, Legal info).

---

## Wave 4: Role-Based Navigation & UX

### Task 1: Dynamic Navigation Sidebar
- **File**: `apps/web/src/components/layout/Sidebar.tsx`
- **Action**: Update the sidebar to conditionally show links based on the user's role.
- **Acceptance Criteria**:
  - "Vendor Dashboard" link only visible to `vendor` users.
  - "Admin Portal" link only visible to `admin` users.

---

## Verification Plan

### Automated Tests
- [ ] **Auth Client**: Mock `auth-service` and verify cookie handling.
- [ ] **Middleware**: Unit test middleware redirects for different role/path combinations.

### Manual Verification (UAT)
- [ ] Register as a Customer → Verify storefront access.
- [ ] Attempt to access `/vendor` as a Customer → Verify "Upgrade to Vendor" landing page appears.
- [ ] Attempt to access `/admin` as a Customer → Verify 404 page appears.
- [ ] Register as a Vendor → Verify dashboard access.
