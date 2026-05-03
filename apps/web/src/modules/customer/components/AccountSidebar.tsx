'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { name: 'My Orders', href: '/account/orders', icon: Package },
  { name: 'Profile Settings', href: '/account/profile', icon: User },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        {!collapsed && (
          <Link href="/account" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>My Account</span>
          </Link>
        )}
        {collapsed && <ShoppingBag className="h-6 w-6 text-primary mx-auto" />}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 rounded-full border border-border bg-background shadow-sm h-6 w-6 p-0"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.name || 'Loading...'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
}
