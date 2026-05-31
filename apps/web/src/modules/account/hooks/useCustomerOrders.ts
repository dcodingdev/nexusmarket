import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";

export const useCustomerOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["customer-orders", page, limit],
    queryFn: async () => {
      return apiClient<any>(`/orders/me?page=${page}&limit=${limit}`);
    },
  });
};


