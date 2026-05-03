'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  MessageSquare,
  Settings, 
  Store,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { name: 'Inventory', href: '/vendor/inventory', icon: Package },
  { name: 'Messages', href: '/vendor/chat', icon: MessageSquare },
  { name: 'Billing', href: '/vendor/billing', icon: Receipt },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
];

export function Sidebar() {
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
      {/* Brand */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        {!collapsed && (
          <Link href="/vendor" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <Store className="h-6 w-6 text-primary" />
            <span>Vendor Hub</span>
          </Link>
        )}
        {collapsed && <Store className="h-6 w-6 text-primary mx-auto" />}
        
        <Button 
          variant="ghost" 
          size="icon-xs" 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 rounded-full border border-border bg-background shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Nav */}
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

        <div className="pt-4 mt-4 border-t border-border">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {!collapsed && <span>View Storefront</span>}
          </Link>
        </div>
      </nav>

      {/* Footer / User Profile */}
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
