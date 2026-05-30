"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/modules/cart/CartDrawer";
import { WishlistDrawer } from "@/modules/wishlist/WishlistDrawer";

import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user, accessToken } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground mr-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline-block">NexusMarket</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/products" className="hover:text-foreground transition-colors">Store</Link>
            </div>
          </div>

          <div className="flex-1 max-w-md px-4 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <div className="flex items-center gap-1">
                <WishlistDrawer />
                <CartDrawer />
              </div>
            )}
            
            {mounted ? (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link href="/account">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-red-500"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">Sign In</Button>
                </Link>
              )
            ) : (
              <div className="w-20 h-9" />
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/30 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span>NexusMarket</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The premier destination for premium goods, built by and for the best vendors worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
                <li><Link href="/categories" className="hover:text-primary">Categories</Link></li>
                <li><Link href="/deals" className="hover:text-primary">Daily Deals</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/account" className="hover:text-primary">Profile</Link></li>
                <li><Link href="/account/orders" className="hover:text-primary">Orders</Link></li>
                <li><Link href="/wishlist" className="hover:text-primary">Wishlist</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              {mounted && isAuthenticated && (user?.role?.toUpperCase() === 'VENDOR' || user?.role?.toUpperCase() === 'ADMIN') ? (
                <>
                  <h3 className="font-bold text-xl">Vendor Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your store, view orders, and track your revenue.
                  </p>
                  <Link href="/vendor" className="inline-block">
                    <Button className="w-full font-bold">Go to Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-xl">Become a Vendor</h3>
                  <p className="text-sm text-muted-foreground">
                    Start selling to millions of customers. Zero setup fees, instant payouts.
                  </p>
                  <Link href="/create-store" className="inline-block">
                    <Button className="w-full font-bold">Create Your Store</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between">
            <span>&copy; {new Date().getFullYear()} NexusMarket. All rights reserved.</span>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
