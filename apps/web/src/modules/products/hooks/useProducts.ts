'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';

export interface Product {
  _id: string;
  name: string;
  price: number;
  mainImage: {
    url: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  category: string;
  description: string;
}

interface ProductsResponse {
  success: boolean;
  docs: Product[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export function useProducts(params: { page?: number; limit?: number; search?: string } = {}) {
  const { page = 1, limit = 10, search = '' } = params;

  return useQuery<ProductsResponse>({
    queryKey: ['products', { page, limit, search }],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.append('search', search);
      
      return apiClient<ProductsResponse>(`/products?${queryParams.toString()}`);
    },
  });
}

export function useProduct(id: string) {
  return useQuery<{ success: boolean; data: Product }>({
    queryKey: ['product', id],
    queryFn: () => apiClient<{ success: boolean; data: Product }>(`/products/${id}`),
    enabled: !!id,
  });
}

