"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { apiClient } from "@/core/api/client";

async function fetchVendorOrders() {
  return apiClient<any>("/orders/vendor");
}

async function updateItemStatus({ orderId, productId, status }: { orderId: string, productId: string, status: string }) {
  return apiClient<any>(`/orders/${orderId}/items/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export default function VendorOrderManager() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: fetchVendorOrders,
  });

  const mutation = useMutation({
    mutationFn: updateItemStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading orders...</div>;

  const orders = data?.docs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Active Orders</h2>
        <Badge variant="secondary" className="px-3 py-1 uppercase tracking-tighter text-[10px]">
          Fulfillment Required
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-muted/20">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active orders found.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <Card key={order._id} className="group overflow-hidden border hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, HH:mm")}</p>
                      </div>
                    </div>

                    <div className="flex-1 max-w-md">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                          <div className="text-sm">
                            <span className="font-medium">SKU-{item.product.slice(-6)}</span>
                            <span className="mx-2 text-muted-foreground">×</span>
                            <span className="font-bold">{item.quantity}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select 
                              defaultValue={item.status} 
                              onValueChange={(val: string) => mutation.mutate({ 
                                orderId: order._id, 
                                productId: item.product, 
                                status: val 
                              })}
                            >
                              <SelectTrigger className="w-[140px] h-8 text-[11px] font-semibold uppercase">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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

