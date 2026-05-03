'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@repo/types';
import { notFound } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  role: UserRole;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard Component
 * Used in Layouts to enforce role boundaries.
 * Supports "404 Masking" for Admin and "Upgrade CTAs" for Vendors.
 */
export const RoleGuard = ({ children, role, fallback }: RoleGuardProps) => {
  const { user, isAuthenticated, role: userRole } = useAuth();

  // If not authenticated, we don't handle redirect here (Middleware does it)
  if (!isAuthenticated) return null;

  // Mask Admin portal if user is not Admin
  if (role === UserRole.ADMIN && userRole !== UserRole.ADMIN) {
    return notFound();
  }

  // Show fallback (e.g. Upgrade CTA) for Vendor routes if user is a Customer
  if (role === UserRole.VENDOR && userRole !== UserRole.VENDOR) {
    return fallback || (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Launch Your Shop Today
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Want to sell on NexusMarket? Upgrade your account to open a vendor dashboard and start listing products in minutes.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
            Upgrade to Vendor
          </button>
          <button className="px-8 py-4 border border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
            Learn More
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
