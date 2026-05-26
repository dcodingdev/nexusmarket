'use client';

import React from 'react';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@repo/types';
import { notFound, useRouter } from 'next/navigation';
import { apiClient } from '@/core/api/client';
import { authClient } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

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
  const [mounted, setMounted] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If not authenticated, we don't handle redirect here (Middleware does it)
  if (!isAuthenticated) return null;

  // Mask Admin portal if user is not Admin
  if (role === UserRole.ADMIN && userRole !== UserRole.ADMIN) {
    return notFound();
  }

  // Handle vendor upgrade
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // 1. Update user role to vendor on backend database
      const updatedUser = await apiClient<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ role: "vendor" }),
      });

      // 2. Trigger session refresh to sign new access token with the updated role
      const refreshData = await authClient.refresh();

      // 3. Update local Zustand state
      useAuthStore.getState().setAuth(updatedUser, refreshData.accessToken);

      toast.success("Account upgraded to Vendor successfully!");
      
      // 4. Force hard redirect to reload dashboard route guard state
      window.location.href = "/vendor";
    } catch (err: any) {
      console.error("Upgrade to vendor failed:", err);
      toast.error(err.message || "Failed to upgrade account. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

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
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isUpgrading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Upgrading...
              </>
            ) : (
              "Upgrade to Vendor"
            )}
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
