import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditCard, Download, ExternalLink } from 'lucide-react';

export const MOCK_INVOICES = [
  { id: 'INV-1023', date: 'May 01, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-0982', date: 'Apr 01, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-0911', date: 'Mar 01, 2026', amount: '$49.00', status: 'Paid' },
];

export default function VendorBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription plan and billing history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Pro Tier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">$49.00 <span className="text-sm font-normal text-muted-foreground">/ month</span></span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your next billing date is <strong>June 01, 2026</strong>.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Your primary payment method for subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border rounded-md">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/28</p>
              </div>
              <Badge>Primary</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full sm:w-auto">Update Payment Method</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
