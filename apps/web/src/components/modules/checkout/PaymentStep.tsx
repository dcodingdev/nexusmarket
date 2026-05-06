"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

import { useAuthStore } from "@/store/useAuthStore";

interface PaymentStepProps {
  shippingData: any;
  onBack: () => void;
  onReset: () => void;
}

export default function PaymentStep({ shippingData, onBack, onReset }: PaymentStepProps) {
  const { items } = useCartStore();
  const { accessToken } = useAuthStore();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!accessToken) return;
      try {
        // 1. Create Order & Lock Stock
        const orderRes = await fetch("http://localhost:8000/api/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items: items.map((i) => ({
              product: i.product,
              vendor: i.vendor,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase,
            })),
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.success) {
          if (orderData.message?.includes("Stock reservation failed")) {
            setErrorMessage(orderData.message || "Some items are out of stock. Please review your cart.");
            setErrorModalOpen(true);
            return;
          }
          throw new Error(orderData.message || "Failed to create order");
        }

        const createdOrderId = orderData.data._id;
        setOrderId(createdOrderId);

        // Calculate total amount
        const amount = items.reduce(
          (acc, item) => acc + item.priceAtPurchase * item.quantity,
          0
        );

        // 2. Create Payment Intent
        const paymentRes = await fetch("http://localhost:8000/api/v1/payments/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            orderId: createdOrderId,
            amount,
            gateway: "STRIPE",
          }),
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok || !paymentData.success) {
          throw new Error(paymentData.message || "Failed to initialize payment");
        }

        setClientSecret(paymentData.gatewayData.client_secret || paymentData.gatewayData.id); // id if mock
      } catch (error: any) {
        console.error("Checkout initialization failed:", error);
        setErrorMessage(error.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [items]);

  const handleModalClose = () => {
    setErrorModalOpen(false);
    onReset(); // Redirect to cart
  };

  if (isLoading) {
    return <div className="text-center py-12">Processing order details...</div>;
  }

  if (errorMessage && !errorModalOpen) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-red-600 mb-4">Checkout Error</h2>
        <p className="mb-6">{errorMessage}</p>
        <Button variant="outline" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div>
      <Dialog open={errorModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Issue</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleModalClose}>Review Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2 className="text-xl font-medium mb-6">Payment</h2>
      {clientSecret && (
        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
          <CheckoutForm onBack={onBack} onReset={onReset} />
        </Elements>
      )}
    </div>
  );
}

function CheckoutForm({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const { clearCart } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      // Since we don't have a real server, we could prevent redirect if we want to handle locally
      // redirect: "if_required", 
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("Payment successful!");
      clearCart();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-sm text-red-500">{message}</div>}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Shipping
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
}
