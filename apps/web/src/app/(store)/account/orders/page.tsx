"use client";

import { useState } from "react";
import { useCustomerOrders } from "@/modules/account/hooks/useCustomerOrders";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useChatUIStore } from "@/store/useChatUIStore";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCustomerOrders(page, 10);
  const { openChat } = useChatUIStore();

  const handleContactVendor = async (order: any) => {
    const vendorId = order.items[0]?.vendor;
    if (!vendorId) {
      toast.error("No vendor found for this order.");
      return;
    }

    const toastId = toast.loading("Opening chat with vendor...");
    try {
      const res = await apiClient<any>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          title: `Inquiry: Order ${order._id.substring(order._id.length - 8).toUpperCase()}`,
          participantIds: [vendorId],
        }),
      });

      toast.success("Connected with seller!", { id: toastId });
      openChat(res.data.id);
    } catch (error: any) {
      toast.error(error.message || "Could not connect to vendor.", { id: toastId });
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case "PAID":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Paid</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Order History</h1>
        <p className="text-muted-foreground mt-2">
          View and track your recent orders.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Failed to load orders.</div>
        ) : !data?.docs?.length ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
            <p className="text-muted-foreground mt-1">When you place an order, it will appear here.</p>
            <Button asChild className="mt-6">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.docs.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium text-xs font-mono">
                      {order._id.substring(order._id.length - 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.orderStatus)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleContactVendor(order)}
                        className="text-indigo-500 hover:text-indigo-600 font-semibold"
                      >
                        Contact Seller
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/account/orders/${order._id}`}>
                          Details <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination placeholder if needed */}
        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {data.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
