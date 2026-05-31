import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  product: string; // Product ID
  name: string;
  image: string;
  price: number;
  vendor: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.product === item.product);
          if (existingItem) {
            return state; // Already in wishlist
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product !== productId),
        })),
      isLiked: (productId) => get().items.some((i) => i.product === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);

