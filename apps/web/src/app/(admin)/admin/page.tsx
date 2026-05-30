"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  Store
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/core/api/client";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

async function fetchAdminStats() {
  const [users, vendors, products, orders] = await Promise.all([
    apiClient<any>("/users"),
    apiClient<any>("/users?role=vendor"),
    apiClient<any>("/products"),
    apiClient<any>("/orders/all"),
  ]);

  return {
    totalUsers: users?.pagination?.total || users?.totalDocs || users?.data?.length || 0,
    activeVendors: vendors?.pagination?.total || vendors?.totalDocs || vendors?.data?.length || 0,
    totalProducts: products?.totalDocs || products?.total || products?.data?.length || 0,
    totalOrders: orders?.totalDocs || orders?.total || orders?.pagination?.total || orders?.data?.length || 0,
    recentVendors: vendors?.data?.slice(0, 5) || [],
    recentProducts: products?.docs?.slice(0, 5) || [],
  };
}

// Mock chart data to simulate activity
const purchaseData = [
  { name: "Mon", purchases: 12 },
  { name: "Tue", purchases: 19 },
  { name: "Wed", purchases: 15 },
  { name: "Thu", purchases: 22 },
  { name: "Fri", purchases: 30 },
  { name: "Sat", purchases: 25 },
  { name: "Sun", purchases: 18 },
];

const stockData = [
  { name: "Electronics", stock: 120 },
  { name: "Clothing", stock: 80 },
  { name: "Home", stock: 150 },
  { name: "Books", stock: 90 },
  { name: "Beauty", stock: 60 },
];

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
    { label: "Active Vendors", value: data?.activeVendors, icon: Store, color: "text-green-500", trend: "+8%" },
    { label: "Products", value: data?.totalProducts, icon: Package, color: "text-purple-500", trend: "+5%" },
    { label: "Orders", value: data?.totalOrders, icon: ShoppingCart, color: "text-orange-500", trend: "+18%" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Purchases Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={purchaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-muted)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Line type="monotone" dataKey="purchases" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-muted)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Bar dataKey="stock" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Recent Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentVendors?.length > 0 ? (
                data?.recentVendors?.map((vendor: any) => (
                  <div key={vendor._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 gap-2">
                    <div>
                      <p className="text-sm font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.email}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit">
                      {vendor.shopDetails?.shopName || "Approved"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent vendors found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              Recently Uploaded Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentProducts?.length > 0 ? (
                data?.recentProducts?.map((product: any) => (
                  <div key={product._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 bg-background rounded border flex items-center justify-center overflow-hidden shrink-0">
                      {product.mainImage?.url ? (
                        <img src={product.mainImage.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-primary font-medium">${product.price}</span>
                        <span>•</span>
                        <span className="truncate">{product.vendor?.name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent products found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
