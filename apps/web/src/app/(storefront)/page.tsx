'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CreditCard, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle2 
} from 'lucide-react';

export default function StorefrontPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-screen bg-background">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider animate-in fade-in slide-in-from-top-4 duration-300">
            <Zap className="w-3.5 h-3.5" />
            Marketplace Version 2.0 Live
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            The Next-Generation <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-600 bg-clip-text text-transparent">
              Decentralized Marketplace
            </span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            NexusMarket connects creators, customers, and vendors in a secure, instant, and borderless e-commerce network. Built for speed and reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                className="w-full h-12 px-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-primary-foreground font-semibold rounded-xl shadow-xl shadow-primary/15 flex items-center justify-center gap-2 group transition-all duration-300"
              >
                Explore Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>

            {isAuthenticated && user?.role?.toUpperCase() === 'VENDOR' ? (
              <Link href="/vendor" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 hover:bg-muted/80 font-semibold">
                  Dashboard Settings
                </Button>
              </Link>
            ) : (
              <Link href={isAuthenticated ? "/vendor" : "/login?redirect=/vendor"} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 hover:bg-muted/80 font-semibold">
                  Start Selling Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 border-b border-border/40 bg-muted/20 backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto">
            <div className="space-y-1">
              <div className="flex justify-center text-primary mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-foreground">99.9%</h3>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Checkout Success</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center text-primary mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-foreground">500+</h3>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Active Vendors</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center text-primary mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-foreground">10K+</h3>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Fulfilled Orders</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center text-primary mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-foreground">100%</h3>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Secure Vaults</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Engineered for Modern Commerce
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Explore the advanced features that make NexusMarket the fastest, most reliable platform to buy and sell products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border bg-card hover:border-primary/30 shadow-sm transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-6 group-hover:bg-primary/15 transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Multi-Gateway Secure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay instantly using either Stripe (Cards, GPay) or Razorpay (UPI, Netbanking) with automated sandbox simulations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border bg-card hover:border-primary/30 shadow-sm transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-6 group-hover:bg-primary/15 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Live Vendor Chat</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Negotiate, ask questions, and resolve queries directly with active shop owners using real-time built-in socket chat.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border bg-card hover:border-primary/30 shadow-sm transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-6 group-hover:bg-primary/15 transition-colors">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Instant Stock Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Never face inventory issues. Real-time stock locks and releases are handled by asynchronous event bus triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED CATALOG DIRECTORY */}
      <section id="products-section" className="py-20 border-b border-border/40 scroll-mt-16 bg-muted/10 relative">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Discover Our Curated Collections
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Browse through our full multi-vendor catalog. Shop unique and trending items from verified independent sellers with secure checkout.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/10">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SELLER CTA SECTION */}
      <section className="py-24 relative overflow-hidden bg-card/40 border-b border-border/40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Launch Your Virtual Storefront
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Create listings, manage inventory and logs, set secure payment rates, and chat live with customers worldwide.
          </p>

          <div className="flex justify-center pt-2">
            {isAuthenticated && user?.role?.toUpperCase() === 'VENDOR' ? (
              <Link href="/vendor">
                <Button className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/10">
                  Open Vendor Portal
                </Button>
              </Link>
            ) : (
              <Link href={isAuthenticated ? "/vendor" : "/login?redirect=/vendor"}>
                <Button className="h-12 px-8 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/10">
                  Become a Seller
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
