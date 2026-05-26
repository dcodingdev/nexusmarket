"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  Sparkles,
  ShoppingBag,
  ShieldAlert,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@nexusmarket.com",
    password: "admin123",
    name: "Nexus Admin",
    role: "admin",
  },
  vendor: {
    email: "vendor@nexusmarket.com",
    password: "password123",
    name: "Nexus Vendor",
    role: "vendor",
  },
  customer: {
    email: "customer@nexusmarket.com",
    password: "password123",
    name: "Nexus Customer",
    role: "customer",
  }
};

export function DevQuickNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { user, logout, login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRoleSwitch = async (role: "customer" | "vendor" | "admin") => {
    setIsSwitching(true);
    const account = DEMO_ACCOUNTS[role];
    const loadingToast = toast.loading(`Switching to ${role} account...`);

    try {
      // 1. Log out current session
      if (isAuthenticated) {
        await logout();
      }

      // 2. Try to log in
      try {
        await login({ email: account.email, password: account.password });
        toast.dismiss(loadingToast);
        toast.success(`Logged in as ${account.name}!`);
        
        // 3. Navigate to appropriate route
        if (role === "admin") router.push("/admin");
        else if (role === "vendor") router.push("/vendor");
        else router.push("/account");
      } catch (loginErr: any) {
        // If login fails (e.g. user doesn't exist yet), auto-register (except admin which should be seeded)
        if (role !== "admin") {
          toast.message(`User not found. Auto-registering ${role} account...`, { id: loadingToast });
          
          const regRes = await fetch("http://localhost:8000/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account),
          });

          if (regRes.ok) {
            // Log in again
            await login({ email: account.email, password: account.password });
            toast.dismiss(loadingToast);
            toast.success(`Registered & Logged in as ${account.name}!`);
            
            if (role === "vendor") router.push("/vendor");
            else router.push("/account");
          } else {
            const errBody = await regRes.json().catch(() => ({}));
            throw new Error(errBody.message || "Auto-registration failed");
          }
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || `Failed to switch to ${role}`);
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-xs border border-white/20"
      >
        <ArrowRightLeft className="w-4 h-4 animate-pulse" />
        <span>Dev Switcher</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-background/95 backdrop-blur-md border border-border/80 p-5 rounded-3xl shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                NexusMarket DevNav
              </span>
            </div>
            {isAuthenticated && (
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {user?.role}
              </span>
            )}
          </div>

          {/* Active status */}
          <div className="bg-muted/40 p-3 rounded-2xl border border-muted text-xs space-y-1">
            <div className="text-muted-foreground flex justify-between">
              <span>Status:</span>
              <span className={isAuthenticated ? "text-emerald-500 font-bold" : "text-yellow-500 font-bold"}>
                {isAuthenticated ? "Authenticated" : "Guest / Public"}
              </span>
            </div>
            {isAuthenticated && (
              <div className="text-foreground truncate flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">User:</span>
                <span className="font-semibold truncate">{user?.email}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-1">
              Select Target Role Portal
            </p>
            
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleSwitch("customer")}
                disabled={isSwitching}
                className="w-full justify-start gap-3 rounded-xl border-border/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-xs font-semibold h-10 transition-all"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>Customer Portal</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleSwitch("vendor")}
                disabled={isSwitching}
                className="w-full justify-start gap-3 rounded-xl border-border/80 hover:border-violet-500/30 hover:bg-violet-500/5 text-xs font-semibold h-10 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-violet-500" />
                <span>Vendor Dashboard</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleSwitch("admin")}
                disabled={isSwitching}
                className="w-full justify-start gap-3 rounded-xl border-border/80 hover:border-blue-500/30 hover:bg-blue-500/5 text-xs font-semibold h-10 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                <span>Admin Dashboard</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push("/products");
                  setIsOpen(false);
                }}
                className="w-full justify-start gap-3 rounded-xl text-xs text-muted-foreground hover:text-foreground h-10 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Storefront Catalog</span>
              </Button>
            </div>
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await logout();
                  setIsOpen(false);
                }}
                className="w-full gap-2 rounded-xl text-xs font-bold h-9"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Current Session</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
