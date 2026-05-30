import { z } from 'zod';

export const CreatePaymentSessionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default('usd'),
  gateway: z.enum(['STRIPE', 'MOCK']).default('STRIPE'),
});

export const RequestPayoutSchema = z.object({
  amount: z.number().positive("Payout amount must be positive"),
});

export type CreatePaymentSessionInput = z.infer<typeof CreatePaymentSessionSchema>;
export type RequestPayoutInput = z.infer<typeof RequestPayoutSchema>;
