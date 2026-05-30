












// roles (unchanged)
export enum UserRole {
  ADMIN = "admin",
  VENDOR = "vendor",
  CUSTOMER = "customer",
}

/**
 * Full User (DB / API response)
 */
export interface User {
  _id: string; // ✅ changed
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * ✅ Auth User (JWT / req.user)
 */
export interface AuthUser {
  _id: string; // ✅ changed
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Auth response (login/signup)
 */
export interface AuthResponse {
  user: User;
  token: string;
}