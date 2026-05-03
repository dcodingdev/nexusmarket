# Phase 5: B2C Experience - Research

## 1. Core Integration Strategy

### 1.1 Order History (Real-time)
- **Service**: `order-service`
- **Endpoint**: `GET /api/v1/orders/my-orders`
- **Controller**: `order.controller.ts` needs a new method `getMyOrders` that filters by `req.user.id`.
- **Types**: Ensure `IOrder` is correctly exported in `@repo/types`.

### 1.2 Review System (Verified Purchaser)
- **Service**: `product-service`
- **Module**: `src/modules/reviews`
- **Schema**:
  ```typescript
  {
    product: Schema.Types.ObjectId, // ref Product
    customer: Schema.Types.ObjectId, // ref User
    rating: Number, // 1-5
    comment: String,
    isVerified: Boolean,
    createdAt: Date
  }
  ```
- **Verification Logic**: Before saving a review, the `product-service` should ideally call `order-service` (or check a shared event log) to verify the user has purchased the item. 
  *Refinement*: For V1, the frontend can pass the `orderId` or the backend can do a lightweight inter-service check.

### 1.3 Address Management (Single Primary)
- **Service**: `auth-service`
- **User Schema Update**:
  ```typescript
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
  ```
- **Endpoint**: `PATCH /api/users/profile` to update name/address.

## 2. Frontend Architecture (apps/web)

### 2.1 Route Structure
- `/(store)/account` (Main dashboard)
- `/(store)/account/orders` (Order list)
- `/(store)/account/profile` (Address & Name edit)

### 2.2 Hooks & State
- `useCustomerOrders`: Fetch orders from `order-service`.
- `useReviews`: Post reviews to `product-service`.
- `useProfile`: Manage user profile updates in `auth-service`.

## 3. Reusable Assets & Patterns
- **AuthGuard**: Already implemented in Phase 4. Use it to wrap the `(store)/account` layout.
- **Data Tables**: Use the pattern from the Vendor Dashboard for the order history table.
- **Forms**: Use React Hook Form + Zod for address and review forms.

## 4. Dependencies
- `@repo/types`: Needs updates for Review and Address types.
- `@repo/api-contracts`: Needs new endpoint definitions for reviews and customer orders.

## 5. Potential Landmines
- **Inter-service Auth**: Ensure `auth-service` JWTs are accepted by `order-service` and `product-service` (should be handled by shared middleware).
- **CORS**: Ensure all microservices allow the web app origin.

## RESEARCH COMPLETE
