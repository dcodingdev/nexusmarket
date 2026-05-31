'use client';

import { useProduct } from '@/modules/products/hooks/useProducts';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Store, Heart } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useChatUIStore } from '@/store/useChatUIStore';
import { apiClient } from '@/core/api/client';
import { MessageSquare } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openChat } = useChatUIStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isLiked } = useWishlistStore();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-6 w-1/4 bg-muted rounded" />
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
        <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const product = data.data;

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      vendor: product.vendor.id,
      quantity: 1,
      priceAtPurchase: product.price,
      name: product.name,
      image: product.mainImage.url,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const liked = isLiked(product._id);
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeWishlist(product._id);
    } else {
      addWishlist({
        product: product._id,
        vendor: product.vendor.id,
        price: product.price,
        name: product.name,
        image: product.mainImage.url,
      });
      toast.success(`${product.name} added to liked products!`);
    }
  };

  const handleChatWithVendor = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to message the seller.");
      router.push(`/login?redirect=/product/${product._id}`);
      return;
    }

    const toastId = toast.loading("Opening chat with seller...");
    try {
      const res = await apiClient<any>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          title: `Inquiry: ${product.name}`,
          participantIds: [product.vendor.id],
        }),
      });

      toast.success("Connected with seller!", { id: toastId });
      openChat(res.data.id);
    } catch (error: any) {
      toast.error(error.message || "Could not connect to seller.", { id: toastId });
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={product.mainImage.url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Store className="h-4 w-4" />
              <span>{product.vendor.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert text-muted-foreground mb-8">
            <p>{product.description || "No description available for this product."}</p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 items-center justify-center gap-2 rounded-xl text-base font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 bg-primary text-primary-foreground"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-xl border-border shadow-sm transition-colors ${liked ? 'text-red-500 bg-red-50/10' : 'text-muted-foreground'}`}
                onClick={toggleWishlist}
              >
                <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <Button 
              variant="outline"
              size="lg" 
              className="flex w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-transform hover:scale-[1.02] active:scale-95 border-border hover:bg-muted"
              onClick={handleChatWithVendor}
            >
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Chat with Seller
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secure payment processing. Worldwide shipping available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

