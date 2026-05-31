"use client";

import { Heart, X, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWishlistStore, WishlistItem } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export function WishlistDrawer() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  if (!mounted) return (
    <Button variant="ghost" size="icon" className="relative">
      <Heart className="h-5 w-5" />
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 text-white border-0 text-[10px]">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Your Wishlist ({items.length})
          </SheetTitle>
          <SheetDescription className="sr-only">Items saved to your wishlist</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Heart className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground text-center">Your wishlist is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Explore Products</Button>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <div key={item.product} className="flex gap-4 border-b pb-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 group">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover transition-transform group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <Link href={`/product/${item.product}`} onClick={() => setIsOpen(false)}>
                        <h4 className="font-medium text-sm line-clamp-2 hover:underline hover:text-primary">{item.name}</h4>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 shrink-0 ml-2" onClick={() => removeItem(item.product)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-medium text-sm">${item.price.toFixed(2)}</p>
                      <Button size="sm" onClick={() => handleAddToCart(item)} className="h-8 gap-2">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

