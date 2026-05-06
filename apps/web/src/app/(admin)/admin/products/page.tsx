"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  Search, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import React from "react";

async function fetchAllProducts(token: string | null, search = "") {
  if (!token) return null;
  const url = search 
    ? `http://localhost:8000/api/v1/products?search=${search}` 
    : `http://localhost:8000/api/v1/products`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function togglePublish(productId: string, token: string | null) {
  if (!token) throw new Error("Unauthorized");
  const res = await fetch(`http://localhost:8000/api/v1/products/${productId}/publish`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to toggle visibility");
  return res.json();
}

export default function ProductOversightPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const { accessToken } = useAuthStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, accessToken],
    queryFn: () => fetchAllProducts(accessToken, search),
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: (productId: string) => togglePublish(productId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product visibility updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const products = data?.docs || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Products</h1>
          <p className="text-muted-foreground mt-1">Monitor and moderate all catalog listings.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-20">Loading platform catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          products.map((product: any) => (
            <Card key={product._id} className="overflow-hidden border-2 hover:border-primary/20 transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {product.mainImage?.url ? (
                      <img src={product.mainImage.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg truncate">{product.name}</h3>
                      {product.isDraft && (
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft / Unlisted</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>Vendor: {product.vendor?.name || product.vendor?.id?.slice(-8)}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>Category: {product.category || "General"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-9" asChild>
                      <a href={`/products/${product._id}`} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" /> View
                      </a>
                    </Button>
                    <Button 
                      variant={product.isDraft ? "default" : "destructive"} 
                      size="sm" 
                      className="h-9 gap-2"
                      onClick={() => mutation.mutate(product._id)}
                    >
                      {product.isDraft ? (
                        <><Eye className="w-4 h-4" /> Publish</>
                      ) : (
                        <><EyeOff className="w-4 h-4" /> Unpublish</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
