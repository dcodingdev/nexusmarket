'use client';

import { useVendorProducts } from '@/modules/products/hooks/useVendorProducts';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MoreHorizontal, Package } from "lucide-react";
import Image from 'next/image';

import { useProductMutations } from '@/modules/products/hooks/useProductMutations';
import { ProductForm } from '@/modules/products/components/ProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useSelection } from '@/hooks/useSelection';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

import { DataTableSkeleton } from '@/modules/vendor/components/DataTableSkeleton';

import { useAuthStore } from '@/store/useAuthStore';

export default function InventoryPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const { user } = useAuthStore();
  const vendorId = user?._id || "v_123"; 
  const { data, isLoading, error } = useVendorProducts(vendorId);
  const { createProduct, updateProduct, deleteProduct } = useProductMutations();

  const products = data?.docs || [];
  const { selectedIds, toggle, selectAll, clear, isSelected, count } = useSelection();

  const handleExport = (ids?: string[]) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    let url = `${baseUrl}/products/export?vendorId=${vendorId}`;
    
    // Add auth token if needed? The backend authenticate middleware uses cookie or header.
    // window.open doesn't send custom headers. I might need a more complex download logic
    // if auth is strictly required via header. But if it's cookie-based, it works.
    // If not, I can use a hidden form or fetch blob.
    
    if (ids && ids.length > 0) {
      ids.forEach(id => url += `&ids=${id}`);
    }
    
    // Using a link click for better download behavior
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success(`Exporting ${ids ? ids.length : 'all'} products...`);
  };

  const handleAddProduct = (formData: any) => {
    createProduct.mutate({
      ...formData,
      vendor: vendorId, // Inject vendor ID
      mainImage: { url: formData.imageUrl }
    }, {
      onSuccess: () => setIsAddOpen(false)
    });
  };

  const handleUpdateProduct = (formData: any) => {
    updateProduct.mutate({
      id: editingProduct._id,
      data: {
        ...formData,
        mainImage: { url: formData.imageUrl }
      }
    }, {
      onSuccess: () => setEditingProduct(null)
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your product catalog and stock levels.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport()}>
            <FileDown className="h-4 w-4" />
            Export All
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details below to list a new product in your store.
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                onSubmit={handleAddProduct} 
                isLoading={createProduct.isPending} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-50 flex items-center justify-between gap-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-foreground text-primary text-xs font-bold">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium">products selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 h-8"
              onClick={() => handleExport(selectedIds)}
            >
              <DownloadCloud className="h-4 w-4" />
              Export Selected
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 hover:bg-primary-foreground/10 text-primary-foreground"
              onClick={clear}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onCheckedChange={(checked) => {
                    if (checked) selectAll(products.map(p => p._id));
                    else clear();
                  }}
                />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={6} />
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Start by adding your first product to the catalog.</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add First Product
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id} className={cn(
                  "hover:bg-muted/30 transition-colors",
                  isSelected(product._id) && "bg-primary/5"
                )}>
                  <TableCell>
                    <Checkbox 
                      checked={isSelected(product._id)}
                      onCheckedChange={() => toggle(product._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded border border-border bg-muted">
                      <Image 
                        src={product.mainImage.url || '/placeholder.jpg'} 
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground font-semibold">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      In Stock
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => setEditingProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-destructive hover:bg-destructive/10" 
                        title="Delete"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{editingProduct?.name}".
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm 
              initialData={editingProduct}
              onSubmit={handleUpdateProduct} 
              isLoading={updateProduct.isPending} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
