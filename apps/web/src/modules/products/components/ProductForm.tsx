'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '../hooks/useProducts';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Please select a category"),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      category: initialData.category,
      imageUrl: initialData.mainImage.url,
    } : {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
    },
  });

  const categoryValue = watch('category');

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input 
          id="name" 
          placeholder="e.g. Handmade Ceramic Mug" 
          {...register('name')} 
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            {...register('price', { valueAsNumber: true })} 
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            onValueChange={(val) => setValue('category', val)} 
            defaultValue={initialData?.category || ""}
          >
            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Handmade">Handmade</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Describe your product in detail..." 
          rows={4}
          {...register('description')} 
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-4">
        <Label>Product Image</Label>
        <ImageUpload 
          value={watch('imageUrl')} 
          onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })} 
        />
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-xs text-muted-foreground italic">Or enter image URL manually</Label>
          <Input 
            id="imageUrl" 
            placeholder="https://example.com/image.jpg" 
            {...register('imageUrl')} 
            className={errors.imageUrl ? "border-destructive" : ""}
          />
          {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

