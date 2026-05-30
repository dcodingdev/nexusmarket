import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Must be valid URLs")).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const UpdateStockSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const ReserveStockSchema = z.object({
  amount: z.number().int().positive("Amount must be positive"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
export type ReserveStockInput = z.infer<typeof ReserveStockSchema>;
