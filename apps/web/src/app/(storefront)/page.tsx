'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { ProductCard } from '@/modules/products/components/ProductCard';
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
  const { data: productsData, isLoading } = useProducts({ limit: 12 });

  return (
    <div className="relative overflow-hidden min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Cinematic Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-40 mix-blend-screen" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[150px] rounded-full pointer-events-none opacity-30 mix-blend-screen" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none opacity-30 mix-blend-screen" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="container mx-auto px-6 text-center max-w-5xl space-y-10">

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] text-foreground drop-shadow-sm">
            The Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40">
              Microservices Marketplace
            </span>
          </h1>

          <p className="text-muted-foreground/70 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            NexusMarket connects creators, customers, and vendors in a secure, high-performance architecture. Built for scale, designed for precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-14 px-10 bg-primary/90 text-primary-foreground font-medium rounded-full shadow-[0_0_40px_-10px] shadow-primary/30 hover:shadow-[0_0_60px_-10px] hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-500 ease-out flex items-center justify-center gap-3 group border border-primary/50 backdrop-blur-md"
              >
                <span className="tracking-wide">Explore Products</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-foreground drop-shadow-sm">
              Engineered for Modern Commerce
            </h2>
            <p className="text-muted-foreground/60 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-light tracking-wide">
              Explore the advanced features that make NexusMarket the fastest, most reliable platform to buy and sell products.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { icon: ShieldCheck, title: 'Secure Authentication', desc: 'Robust and secure authentication system protecting user data and facilitating seamless onboarding.' },
              { icon: MessageSquare, title: 'Live Vendor Chat', desc: 'Negotiate, ask questions, and resolve queries directly with shop owners using real-time socket chat.' },
              { icon: Zap, title: 'Dynamic Product Catalog', desc: 'Lightning-fast inventory management with instant stock sync across the entire platform.' },
              { icon: TrendingUp, title: 'Seamless Order Management', desc: 'Advanced order tracking and fulfillment workflows designed for high-volume transactions.' },
              { icon: CreditCard, title: 'Multi-Gateway Payments', desc: 'Securely process payments instantly through integrated global payment gateways.' }
            ].map((feature, i) => (
              <div key={i} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] group relative p-8 md:p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-700 overflow-hidden flex flex-col justify-between shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:shadow-[0_0_40px_-10px] group-hover:shadow-primary/30 transition-all duration-500 ease-out">
                    <feature.icon className="w-6 h-6 text-muted-foreground/60 group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-foreground/90 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground/60 leading-relaxed font-light tracking-wide">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CURATED CATALOG DIRECTORY */}
      <section id="products-section" className="py-24 md:py-32 relative z-10 border-t border-white/[0.02]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl text-center space-y-16 relative">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-foreground drop-shadow-sm">
              Latest Products
            </h2>
            <p className="text-muted-foreground/60 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-light tracking-wide">
              Browse through our multi-vendor catalog. Shop unique items from independent sellers.
            </p>
          </div>

          <div className="text-left">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/[0.02] border border-white/[0.05] rounded-[2rem] h-[400px]" />
                ))}
              </div>
            ) : productsData?.docs && productsData.docs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {productsData.docs.map(product => (
                  <ProductCard key={product._id} product={{ ...product, id: product._id } as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 text-muted-foreground/40 border border-dashed border-white/[0.05] rounded-[2.5rem] bg-white/[0.01]">
                <p className="text-lg tracking-wide font-light">No products found yet.</p>
              </div>
            )}
          </div>

          <div className="pt-12">
            <Link href="/products">
              <Button size="lg" className="h-14 px-10 bg-white/[0.02] text-foreground font-medium rounded-full border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 transition-all duration-500 ease-out backdrop-blur-md tracking-wide">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

