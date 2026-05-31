'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import { Product } from './useProducts';

interface VendorProductsResponse {
  success: boolean;
  docs: Product[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export function useVendorProducts(vendorId: string, params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = params;

  return useQuery<VendorProductsResponse>({
    queryKey: ['vendor-products', vendorId, { page, limit }],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      // Note: Endpoint from RESEARCH.md / API structure
      return apiClient<VendorProductsResponse>(`/products/vendor/${vendorId}?${queryParams.toString()}`);
    },
    enabled: !!vendorId,
  });
}

