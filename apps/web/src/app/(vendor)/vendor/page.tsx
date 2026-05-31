"use client";

import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import { MOCK_INVOICES } from './billing/page';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorDashboardPage() {
  const { user } = useAuthStore();
  
  // Fetch products for the vendor to get the total count
  const { data: productsData } = useQuery({
    queryKey: ['vendor-products', user?._id],
    queryFn: () => apiClient<any>(`/products?vendor=${user?._id}&limit=1`),
    enabled: !!user?._id,
  });

  const totalProducts = productsData?.totalDocs || 0;

  const totalRevenue = MOCK_INVOICES.reduce((acc, inv) => {
    return acc + parseFloat(inv.amount.replace('$', ''));
  }, 0);

  const chartData = [...MOCK_INVOICES].reverse().map(inv => ({
    name: inv.date.split(',')[0],
    revenue: parseFloat(inv.amount.replace('$', ''))
  }));

  const stats = [
    { name: 'Total Products', value: totalProducts.toString(), icon: Package, change: '+0 this month', changeType: 'positive' },
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, change: '+12% from last month', changeType: 'positive' },
    { name: 'Active Customers', value: '24', icon: Users, change: '+4 from last week', changeType: 'positive' },
    { name: 'Conversion Rate', value: '3.2%', icon: TrendingUp, change: '+0.5% from yesterday', changeType: 'positive' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Vendor'}!</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className={stat.changeType === 'positive' ? "text-xs font-medium text-green-600" : "text-xs font-medium text-red-600"}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="flex-1 w-full" style={{ minHeight: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-muted)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm border-l-4 border-primary">
              <p className="font-medium">Welcome to your dashboard</p>
              <p className="text-xs text-muted-foreground mt-1">Start by adding your first product!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

