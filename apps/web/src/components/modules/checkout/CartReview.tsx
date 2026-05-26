"use client";

import { useMemo } from "react";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CartReviewProps {
  onNext: () => void;
}



export default function CartReview({ onNext }: CartReviewProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.vendor]) {
        acc[item.vendor] = [];
      }
      acc[item.vendor].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + item.priceAtPurchase * item.quantity,
      0
    );
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some items to proceed to checkout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([vendorId, vendorItems]) => (
        <div key={vendorId} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Vendor: {vendorId}
          </h3>
          <ul className="space-y-4">
            {vendorItems.map((item) => (
              <li key={item.product} className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded overflow-hidden bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      priority
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.priceAtPurchase.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.product, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => removeItem(item.product)}
                  >
                    &times;
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-6 mt-6">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
          <Button onClick={onNext} size="lg">
            Proceed to Shipping
          </Button>
        </div>
      </div>
    </div>
  );
}
