"use client";

import { useEffect, useState, useRef } from "react";
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
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/core/api/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, Wallet } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface PaymentStepProps {
  shippingData: any;
  onBack: () => void;
  onReset: () => void;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentStep({ shippingData, onBack, onReset }: PaymentStepProps) {
  const { items } = useCartStore();
  const { accessToken } = useAuthStore();
  const [selectedGateway, setSelectedGateway] = useState<"STRIPE" | "RAZORPAY">("STRIPE");
  const [clientSecret, setClientSecret] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!accessToken || initializedRef.current) return;

    const initializeCheckout = async () => {
      initializedRef.current = true;
      try {
        // 1. Create Order & Lock Stock
        const orderData = await apiClient<{ success: boolean; data: any }>("/orders", {
          method: "POST",
          body: JSON.stringify({
            items: items.map((i) => ({
              product: i.product,
              vendor: i.vendor,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase,
            })),
          }),
        });

        const createdOrderId = orderData.data._id;
        setOrderId(createdOrderId);
      } catch (error: any) {
        console.error("Checkout initialization failed:", error);
        initializedRef.current = false; // Allow retry on error
        
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("stock") || msg.includes("inventory") || msg.includes("out of stock") || msg.includes("reservation failed")) {
          setErrorMessage(error.message || "Some items are out of stock. Please review your cart.");
          setErrorModalOpen(true);
        } else if (msg.includes("session expired") || msg.includes("please log in again") || msg.includes("unauthorized") || msg.includes("invalid token")) {
          setErrorMessage("Your session has expired. Please log in again.");
        } else {
          setErrorMessage(error.message || "An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [items, accessToken]);

  const handleModalClose = () => {
    setErrorModalOpen(false);
    onReset(); // Redirect to cart
  };

  const handleProceedToPayment = async () => {
    if (!orderId) return;
    setIsProcessingPayment(true);
    setErrorMessage("");

    try {
      const amount = items.reduce(
        (acc, item) => acc + item.priceAtPurchase * item.quantity,
        0
      );

      const paymentData = await apiClient<{ success: boolean; gatewayData: any }>("/payments/process", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          amount,
          gateway: selectedGateway,
        }),
      });

      if (selectedGateway === "STRIPE") {
        setClientSecret(paymentData.gatewayData.client_secret || paymentData.gatewayData.id); // id if mock
      } else {
        setRazorpayOrderId(paymentData.gatewayData.id); // order ID (real or mock)
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      setErrorMessage(error.message || "Failed to initialize payment gateway.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleResetPayment = () => {
    setClientSecret("");
    setRazorpayOrderId("");
    setErrorMessage("");
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground font-medium animate-pulse">Processing order details...</div>;
  }

  if (errorMessage && !errorModalOpen && !clientSecret && !razorpayOrderId) {
    const isSessionExpired = errorMessage.includes("Session expired") || errorMessage.includes("log in again");
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-red-600 mb-4">Checkout Error</h2>
        <p className="mb-6 text-muted-foreground">{errorMessage}</p>
        {isSessionExpired ? (
          <Link href="/login?redirect=/checkout" passHref>
            <Button>Log In</Button>
          </Link>
        ) : (
          <Button variant="outline" onClick={onBack}>Go Back</Button>
        )}
      </div>
    );
  }

  const amount = items.reduce(
    (acc, item) => acc + item.priceAtPurchase * item.quantity,
    0
  );

  // 1. Selection State
  if (!clientSecret && !razorpayOrderId) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-300">
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

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Select Payment Method</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how you would like to complete your order</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Stripe Card */}
          <div
            onClick={() => setSelectedGateway("STRIPE")}
            className={`cursor-pointer rounded-2xl border-2 p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
              selectedGateway === "STRIPE"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border hover:border-foreground/50 hover:bg-muted/30"
            }`}
          >
            {selectedGateway === "STRIPE" && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1 animate-in scale-in duration-200">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl ${selectedGateway === "STRIPE" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"} transition-colors`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Stripe Secure Pay</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay with credit or debit cards, Apple Pay, and Google Pay worldwide.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Cards, Wallets</span>
              <span className={selectedGateway === "STRIPE" ? "text-primary" : ""}>Select Stripe</span>
            </div>
          </div>

          {/* Razorpay Card */}
          <div
            onClick={() => setSelectedGateway("RAZORPAY")}
            className={`cursor-pointer rounded-2xl border-2 p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
              selectedGateway === "RAZORPAY"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border hover:border-foreground/50 hover:bg-muted/30"
            }`}
          >
            {selectedGateway === "RAZORPAY" && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1 animate-in scale-in duration-200">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl ${selectedGateway === "RAZORPAY" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"} transition-colors`}>
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Razorpay Instant</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay using UPI (GPay, PhonePe), Netbanking, Wallets, and Indian credit/debit cards.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>UPI, Netbanking</span>
              <span className={selectedGateway === "RAZORPAY" ? "text-primary" : ""}>Select Razorpay</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Preview & Order Summary */}
        <div className="mt-6 rounded-2xl border bg-muted/20 p-5 space-y-4">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h4 className="font-medium text-foreground">Shipping Address</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {shippingData?.fullName}<br />
                {shippingData?.addressLine1}, {shippingData?.city}<br />
                {shippingData?.postalCode}, {shippingData?.country}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              Edit
            </Button>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-foreground">
            <span>Total Amount</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={isProcessingPayment}>
            Back to Shipping
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={isProcessingPayment}
            className="bg-primary text-primary-foreground hover:bg-primary/95 px-8"
          >
            {isProcessingPayment ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Initializing Gateway...
              </span>
            ) : (
              "Confirm & Pay"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 2. Stripe Payment Screen
  if (selectedGateway === "STRIPE" && clientSecret) {
    const isMock = clientSecret.startsWith("pi_mock_");
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        <h2 className="text-xl font-semibold mb-2">Card Payment Details</h2>
        {isMock ? (
          <MockPaymentForm
            onBack={handleResetPayment}
            onReset={onReset}
            transactionId={clientSecret}
            gateway="STRIPE"
          />
        ) : (
          <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
            <CheckoutForm onBack={handleResetPayment} onReset={onReset} />
          </Elements>
        )}
      </div>
    );
  }

  // 3. Razorpay Payment Screen
  if (selectedGateway === "RAZORPAY" && razorpayOrderId) {
    const isMock = razorpayOrderId.startsWith("order_mock_");
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        <h2 className="text-xl font-semibold mb-2">Razorpay Payment Gateway</h2>
        {isMock ? (
          <MockPaymentForm
            onBack={handleResetPayment}
            onReset={onReset}
            transactionId={razorpayOrderId}
            gateway="RAZORPAY"
          />
        ) : (
          <RazorpayPaymentForm
            onBack={handleResetPayment}
            razorpayOrderId={razorpayOrderId}
            amount={amount}
            orderId={orderId}
          />
        )}
      </div>
    );
  }

  return null;
}

function MockPaymentForm({ 
  onBack, 
  onReset, 
  transactionId,
  gateway
}: { 
  onBack: () => void; 
  onReset: () => void; 
  transactionId: string; 
  gateway: "STRIPE" | "RAZORPAY";
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const { clearCart } = useCartStore();
  const router = useRouter();

  const handleMockPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage("");

    try {
      // Call mock confirm endpoint
      await apiClient("/payments/mock-confirm", {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      });

      setMessage("Payment successful!");
      clearCart();
      
      // Redirect to success page
      router.push(`/checkout/success?payment_intent=${transactionId}&redirect_status=succeeded&gateway=${gateway}`);
    } catch (err: any) {
      setMessage(err.message || "Mock payment confirmation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleMockPay} className="space-y-6 max-w-md mx-auto p-6 border rounded-xl bg-card shadow-sm">
      <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 text-sm border border-yellow-200 dark:border-yellow-900/30">
        <h4 className="font-semibold mb-1">💳 Sandbox Mock {gateway === "STRIPE" ? "Stripe" : "Razorpay"} Payment</h4>
        <p>
          {gateway === "STRIPE" 
            ? "Stripe API keys are not configured. You can safely confirm a mock payment below to test the end-to-end checkout flow."
            : "Razorpay API keys are not configured. You can safely confirm a mock payment below to test the end-to-end checkout flow."}
        </p>
      </div>

      <div className="space-y-4">
        {gateway === "STRIPE" ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Simulated Cardholder Name</label>
              <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="John Doe" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Simulated Card Number</label>
              <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="4242 4242 4242 4242" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry</label>
                <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="12/28" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="123" disabled />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Simulated UPI ID</label>
              <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="success@razorpay" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Simulated Phone Number</label>
              <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="+91 99999 99999" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Simulated Netbanking Bank</label>
              <input type="text" className="w-full p-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed text-sm" defaultValue="State Bank of India" disabled />
            </div>
          </>
        )}
      </div>

      {message && <div className="text-sm font-medium text-red-500">{message}</div>}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          Change Method
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95" disabled={isProcessing}>
          {isProcessing ? "Processing Simulation..." : "Simulate Payment Now"}
        </Button>
      </div>
    </form>
  );
}

function RazorpayPaymentForm({
  onBack,
  razorpayOrderId,
  amount,
  orderId,
}: {
  onBack: () => void;
  razorpayOrderId: string;
  amount: number;
  orderId: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { clearCart } = useCartStore();

  const handleRazorpayPay = async () => {
    setIsProcessing(true);
    setMessage("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      const { user } = useAuthStore.getState();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SYtsbbP2Fy3CWm",
        amount: Math.round(amount * 100), // paise
        currency: "USD",
        name: "NexusMarket",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          clearCart();
          router.push(`/checkout/success?payment_intent=${razorpayOrderId}&redirect_status=succeeded&gateway=RAZORPAY`);
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage(err.message || "Failed to launch Razorpay payment modal.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6 border rounded-xl bg-card shadow-sm text-center">
      <div className="p-4 bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-primary border border-primary/10">
        <Wallet className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Razorpay Checkout</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Complete your purchase securely. A popup window will open for payment authorization.
        </p>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 space-y-2 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Reference</span>
          <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={orderId}>{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Razorpay Order ID</span>
          <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={razorpayOrderId}>{razorpayOrderId}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span>Amount Payable</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      {message && <div className="text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{message}</div>}

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={handleRazorpayPay} disabled={isProcessing} className="w-full h-11">
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Opening Gateway...
            </span>
          ) : (
            "Pay with Razorpay"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing} className="w-full">
          Change Payment Method
        </Button>
      </div>
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
          Change Payment Method
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
}
