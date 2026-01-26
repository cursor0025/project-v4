'use client';

import { create } from 'zustand';

export type CartItem = {
  cart_id?: string;
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_logo?: string | null;
  name: string;
  price: number;
  image_url: string | null;
  max_stock: number;
  quantity: number;
};

export type VendorCart = {
  vendor_id: string;
  vendor_name: string;
  vendor_logo?: string | null;
  items: CartItem[];
  subtotal: number;
};

type CartState = {
  items: CartItem[];
  isHydrated: boolean;
  isLoading: boolean;

  // Charger les items depuis Supabase
  setItems: (items: CartItem[]) => void;

  // Groupé par vendeur - FONCTION (pas propriété)
  itemsByVendor: () => Record<string, CartItem[]>;

  // Version alternative
  getVendors: () => VendorCart[];

  // Mise à jour locale optimiste
  updateItemLocally: (product_id: string, quantity: number) => void;
  removeItemLocally: (product_id: string) => void;

  // Vider le panier
  clear: () => void;

  // État
  setHydrated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isHydrated: false,
  isLoading: false,

  setItems: (items) => {
    set({ items, isHydrated: true, isLoading: false });
  },

  // ✅ FONCTION qui retourne un objet
  itemsByVendor: () => {
    const items = get().items;
    const grouped: Record<string, CartItem[]> = {};

    items.forEach((item) => {
      if (!grouped[item.vendor_id]) {
        grouped[item.vendor_id] = [];
      }
      grouped[item.vendor_id].push(item);
    });

    return grouped;
  },

  // ✅ VERSION ALTERNATIVE qui retourne un tableau
  getVendors: () => {
    const items = get().items;
    const map = new Map<string, VendorCart>();

    for (const item of items) {
      if (!map.has(item.vendor_id)) {
        map.set(item.vendor_id, {
          vendor_id: item.vendor_id,
          vendor_name: item.vendor_name || 'Vendeur',
          vendor_logo: item.vendor_logo ?? null,
          items: [],
          subtotal: 0,
        });
      }

      const group = map.get(item.vendor_id)!;
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    }

    return Array.from(map.values());
  },

  updateItemLocally: (product_id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.product_id !== product_id),
        };
      }

      return {
        items: state.items.map((item) =>
          item.product_id === product_id
            ? {
                ...item,
                quantity:
                  quantity > item.max_stock ? item.max_stock : quantity,
              }
            : item
        ),
      };
    });
  },

  removeItemLocally: (product_id) => {
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== product_id),
    }));
  },

  clear: () => set({ items: [], isHydrated: true }),

  setHydrated: (value) => set({ isHydrated: value }),

  setLoading: (value) => set({ isLoading: value }),
}));
