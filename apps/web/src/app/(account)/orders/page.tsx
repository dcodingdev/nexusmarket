"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import OrderTimeline from "@/components/modules/orders/OrderTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { apiClient } from "@/core/api/client";

async function fetchMyOrders() {
  return apiClient<any>("/orders/me");
}


export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
  });

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="container py-8 text-center text-red-500">Error loading orders. Please try again.</div>;
  }

  const orders = data?.docs || [];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <Badge variant="outline" className="px-3 py-1">
          {orders.length} Orders
        </Badge>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <Card key={order._id} className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-sm font-semibold">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Placed On</p>
                    <p className="text-sm">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</p>
                    <p className="text-sm font-bold">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Badge 
                    className={cn(
                      "px-3 py-1 text-xs font-bold",
                      order.orderStatus === "PAID" ? "bg-green-500" : "bg-blue-500"
                    )}
                  >
                    {order.orderStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Product ID: {item.product.slice(-6)}</p>
                            <p className="text-xs text-muted-foreground">Vendor: {item.vendor.slice(-6)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Qty: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">${item.priceAtPurchase.toFixed(2)}</p>
                        </div>
                      </div>
                      <OrderTimeline status={item.status} />
                    </div>
                  ))}
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
