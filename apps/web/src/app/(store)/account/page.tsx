'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Recent Orders', value: 'View History', icon: Package, href: '/account/orders' },
    { name: 'My Reviews', value: 'Check Ratings', icon: Star, href: '/account/orders' }, // reviews link to orders for now
    { name: 'Shipping Address', value: user?.address?.city || 'Not set', icon: MapPin, href: '/account/profile' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your orders, track deliveries, and update your profile.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Primary Address:</span>{' '}
              <span className="text-muted-foreground">
                {user?.address 
                  ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}`
                  : 'No address added yet.'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Stay updated on your shopping journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic">
              Order tracking and status updates will appear here soon.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
