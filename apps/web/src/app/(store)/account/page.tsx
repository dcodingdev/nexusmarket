"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, Clock } from "lucide-react";

export default function AccountDashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.name || "Customer"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your orders, profile, and addresses from your account dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats / Shortcuts */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recent Orders</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Heart className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saved Items</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <MapPin className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Addresses</p>
            <h3 className="text-2xl font-bold">{(user as any)?.address ? "1" : "0"}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-full">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
}
