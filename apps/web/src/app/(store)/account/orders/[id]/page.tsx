import React from 'react';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
      <p className="text-muted-foreground">Details for order ID: {params.id}</p>
      <div className="p-6 border rounded-lg bg-card text-sm text-muted-foreground">
        Order information will be displayed here.
      </div>
    </div>
  );
}
