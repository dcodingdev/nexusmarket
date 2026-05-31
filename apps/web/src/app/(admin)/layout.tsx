"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings,
  ShieldCheck,
  Menu,
  LogOut,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/types";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Package, label: "Global Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Order Feed", href: "/admin/orders" },
];

import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <RoleGuard role={UserRole.ADMIN}>
      <div className="flex min-h-screen bg-muted/20">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 flex items-center gap-2 border-b">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin Portal</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              View Storefront
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="h-16 border-b bg-background flex items-center justify-between px-6 md:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-bold tracking-tight">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs font-semibold px-3 py-1.5 border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                <span>View Store</span>
              </Link>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

