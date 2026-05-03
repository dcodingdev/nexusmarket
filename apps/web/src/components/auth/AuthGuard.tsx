'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@repo/types';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 * Protects client-side components based on authentication and roles
 */
export const AuthGuard = ({ children, allowedRoles, fallback }: AuthGuardProps) => {
  const { user, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  // If role check is required
  if (allowedRoles && role && !allowedRoles.includes(role as UserRole)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
};
