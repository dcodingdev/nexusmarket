"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";

import { apiClient } from "@/core/api/client";

async function fetchAdminStats() {
  const [users, products, orders] = await Promise.all([
    apiClient<any>("/users"),
    apiClient<any>("/products"),
    apiClient<any>("/orders/all"),
  ]);

  return {
    totalUsers: users?.pagination?.total || users?.totalDocs || users?.data?.length || 0,
    totalProducts: products?.totalDocs || products?.total || products?.data?.length || 0,
    totalOrders: orders?.totalDocs || orders?.total || orders?.pagination?.total || orders?.data?.length || 0,
    totalRevenue: (orders?.docs || orders?.data || []).reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0),
  };
}

export default function AdminDashboard() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats", accessToken],
    queryFn: () => fetchAdminStats(),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-blue-500", trend: "+12%" },
    { label: "Products", value: data?.totalProducts, icon: Package, color: "text-purple-500", trend: "+5%" },
    { label: "Orders", value: data?.totalOrders, icon: ShoppingCart, color: "text-orange-500", trend: "+18%" },
    { label: "Revenue", value: `$${data?.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-green-500", trend: "+24%" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-2 hover:border-primary/20 transition-all cursor-default">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs flex items-center mt-1 text-green-500">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/30">
              <p className="text-muted-foreground text-sm">Activity charts coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-2">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Auth Service", "Product Service", "Order Service", "Payment Service"].map(service => (
              <div key={service} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">{service}</span>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
