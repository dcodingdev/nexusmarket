import { LoginInput, RegisterInput } from '@repo/api-contracts';
import { User } from '@repo/types';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8000/api/v1/auth';


/**
 * Authentication Client
 * Handles HttpOnly cookie exchange and token management
 */
export const authClient = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginInput): Promise<{ user: User; accessToken: string }> {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    return res.json();
  },

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<{ user: User }> {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }

    return res.json();
  },

  /**
   * Refresh the access token using the HttpOnly refresh token
   */
  async refresh(): Promise<{ accessToken: string }> {
    const res = await fetch(`${AUTH_URL}/refresh`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Session expired');
    }

    return res.json();
  },

  /**
   * Logout and clear cookies
   */
  async logout(): Promise<void> {
    await fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
    });
  },
};
