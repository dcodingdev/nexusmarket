"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Make sure cart is cleared upon landing on the success page
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-md w-full mx-auto text-center space-y-8 p-8 border rounded-3xl bg-card/60 backdrop-blur-md shadow-2xl border-border/80 relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
          <div className="relative rounded-full bg-green-500/10 p-5 text-green-500 border border-green-500/20">
            <CheckCircle2 className="w-16 h-16 stroke-[1.5]" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text">
          Order Placed!
        </h1>
        <p className="text-muted-foreground text-base">
          Thank you for your purchase. Your payment was processed successfully.
        </p>
      </div>

      {/* Payment Details Card */}
      {paymentIntent && (
        <div className="rounded-2xl bg-muted/40 border border-muted/85 p-5 text-left text-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wider font-semibold border-b border-muted pb-2">
            <span>Payment Summary</span>
            <span className="text-green-600 dark:text-green-400 font-medium normal-case bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
              {redirectStatus || "Succeeded"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs select-all text-right max-w-[200px] truncate" title={paymentIntent}>
              {paymentIntent}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="text-foreground font-medium">
              {paymentIntent.startsWith("pi_mock_") || paymentIntent.startsWith("session_mock_")
                ? "Sandbox simulation"
                : "Stripe secure"}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Link href="/account/orders" passHref className="w-full">
          <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/10 group flex items-center justify-center gap-2">
            <ClipboardCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            View My Orders
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Link href="/" passHref className="w-full">
          <Button variant="outline" className="w-full h-11 rounded-xl border-border/80 hover:bg-muted/80 flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[85vh] bg-background flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Completing checkout...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
