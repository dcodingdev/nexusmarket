'use client';

import { useProducts } from '@/modules/products/hooks/useProducts';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { ProductCard } from '@/modules/products/components/ProductCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useProducts({ search, limit: 20 });

  const products = data?.docs || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
            Our Catalog
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse through all available products on NexusMarket.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">Unable to load products</h2>
          <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">No products found</h2>
          <p className="mt-2 text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <MasonryGrid>
          {products.map((product) => (
            <Link key={product._id} href={`/product/${product._id}`}>
              <ProductCard 
                product={{
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  mainImage: product.mainImage,
                  vendor: product.vendor
                }} 
              />
            </Link>
          ))}
        </MasonryGrid>
      )}
    </div>
  );
}

