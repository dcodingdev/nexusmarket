'use client';

import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mainImage: {
      url: string;
    };
    vendor: {
      id?: string;
      name: string;
    };
  };
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isLiked } = useWishlistStore();
  const liked = isLiked(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        product: product.id,
        vendor: product.vendor.id || 'unknown_vendor',
        price: product.price,
        name: product.name,
        image: product.mainImage.url,
      });
      toast.success(`${product.name} added to liked products!`);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1 mb-8">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.mainImage.url || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full shadow-md z-10 transition-colors duration-300 ${liked ? 'text-red-500 bg-white hover:bg-white/90' : 'text-muted-foreground bg-white/70 hover:bg-white'}`}
          onClick={toggleWishlist}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </Button>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button 
            variant="default"
            size="sm"
            className="flex items-center gap-2 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({
                product: product.id,
                vendor: product.vendor.id || 'unknown_vendor',
                quantity: 1,
                priceAtPurchase: product.price,
                name: product.name,
                image: product.mainImage.url,
              });
              toast.success(`${product.name} added to cart!`);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {product.vendor.name}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </div>
          <p className="text-sm font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

