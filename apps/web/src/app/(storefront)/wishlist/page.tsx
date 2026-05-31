"use client";

import { useWishlistStore, WishlistItem } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      product: item.product,
      vendor: item.vendor,
      quantity: 1,
      priceAtPurchase: item.price,
      name: item.name,
      image: item.image,
    });
    toast.success("Added to cart");
  };

  if (!mounted) {
    return <div className="container mx-auto px-4 py-16 min-h-[50vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border border-border">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-md text-center mb-8">
            You haven't saved any items to your wishlist yet. Start exploring our products and save your favorites!
          </p>
          <Link href="/products">
            <Button size="lg">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={clearWishlist}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear Wishlist
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.product} className="flex flex-col rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-all">
                <div className="relative aspect-square bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-3 right-3 rounded-full text-red-500 bg-white hover:bg-white/90 shadow-sm"
                    onClick={() => removeItem(item.product)}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <Link href={`/product/${item.product}`}>
                      <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-xl font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  <Button className="w-full mt-6 gap-2" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

