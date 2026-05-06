"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShoppingCart, Package, User, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthStore } from "@/store/useAuthStore";

async function fetchAllOrders(token: string | null) {
  if (!token) return null;
  const res = await fetch("http://localhost:8000/api/v1/orders/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch all orders");
  return res.json();
}

export default function AdminOrderFeedPage() {
  const { accessToken } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders-all", accessToken],
    queryFn: () => fetchAllOrders(accessToken),
    enabled: !!accessToken,
  });

  const orders = data?.docs || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Order Feed</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring of all platform transactions.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No orders have been placed yet.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <Card key={order._id} className="border-2 hover:border-primary/20 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-[10px]">#{order._id.slice(-8).toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Customer: {order.customer?.slice(-6) || "Guest"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{order.items.length} Items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <span className="text-xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                    <Badge className={cn(
                      "uppercase text-[10px] tracking-wider font-bold",
                      order.orderStatus === "PAID" ? "bg-green-500" : "bg-blue-500"
                    )}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
