import CheckoutWizard from "@/components/modules/checkout/CheckoutWizard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "Checkout - NexusMarket",
  description: "Complete your purchase securely.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center mt-12">Checkout</h1>
        <AuthGuard>
          <CheckoutWizard />
        </AuthGuard>
      </main>
    </div>
  );
}
