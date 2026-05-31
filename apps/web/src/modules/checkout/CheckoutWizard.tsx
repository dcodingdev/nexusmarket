"use client";

import { useState, useEffect } from "react";
import CartReview from "./CartReview";
import ShippingForm from "./ShippingForm";
import PaymentStep from "./PaymentStep";

export default function CheckoutWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingData, setShippingData] = useState<any>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const steps = ["Cart Review", "Shipping", "Payment"];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Indicator */}
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <svg
                  className="w-5 h-5 ml-4 text-muted-foreground"
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        {currentStep === 0 && <CartReview onNext={nextStep} />}
        {currentStep === 1 && (
          <ShippingForm
            onNext={(data) => {
              setShippingData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {currentStep === 2 && (
          <PaymentStep
            shippingData={shippingData}
            onBack={prevStep}
            onReset={() => setCurrentStep(0)}
          />
        )}
      </div>
    </div>
  );
}

