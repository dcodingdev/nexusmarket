import Stripe from "stripe";

// Update the apiVersion to match the expected type
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia", 
});