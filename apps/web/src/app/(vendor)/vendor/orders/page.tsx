import VendorOrderManager from "@/modules/orders/VendorOrderManager";

export const metadata = {
  title: "Vendor Orders - NexusMarket",
  description: "Manage and fulfill your customer orders.",
};

export default function VendorOrdersPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Order Fulfillment</h1>
          <p className="text-muted-foreground mt-2">Manage your items, track progress, and update shipping statuses.</p>
        </header>
        
        <VendorOrderManager />
      </div>
    </div>
  );
}

