import { z } from 'zod';

export const OrderItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  vendor: z.string().min(1, "Vendor ID is required").optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  priceAtPurchase: z.number().positive("Price must be positive"),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Order must contain at least one item"),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  shippingAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
  }).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
