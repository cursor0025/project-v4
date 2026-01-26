'use client';

import { create } from 'zustand';

export type CartItem = {
  cart_id?: string;          // id de la ligne en base (optionnel côté client)
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  price: number;
  image_url: string | null;
  max_stock: number;
  quantity: number;
};

export type VendorCart = {
  vendor_id: string;
  vendor_name: string;
  items: CartItem[];
  subtotal: number;
};

type CartState = {
  items: CartItem[]; // liste plate
  isHydrated: boolean;

  // Groupé par vendeur (calculé à la volée)
  getVendors(): VendorCart[];

  // Ajout local (ProductCard) — on vérifiera le stock côté UI
  addItem: (item: Omit<CartItem, 'quantity' | 'subtotal'> & { quantity?: number }) => void;

  // Changer quantité (+/-)
  updateQuantity: (product_id: string, quantity: number) => void;

  // Supprimer un article
  removeItem: (product_id: string) => void;

  // Vérifier si on peut ajouter X unités par rapport au stock
  canAddItem: (product_id: string, addQty: number, maxStock: number) => boolean;

  // Vider le panier local (après commande ou logout)
  clear: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isHydrated: false,

  getVendors: () => {
    const items = get().items;

    const map = new Map<string, VendorCart>();

    for (const item of items) {
      if (!map.has(item.vendor_id)) {
        map.set(item.vendor_id, {
          vendor_id: item.vendor_id,
          vendor_name: item.vendor_name || 'Vendeur',
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

  addItem: (item) => {
    set((state) => {
      const quantity = item.quantity ?? 1;
      const existingIndex = state.items.findIndex(
        (i) => i.product_id === item.product_id
      );

      // Si déjà présent, on incrémente
      if (existingIndex !== -1) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;

        updated[existingIndex] = {
          ...existing,
          quantity: newQty > existing.max_stock ? existing.max_stock : newQty,
        };

        return { items: updated };
      }

      // Sinon on ajoute
      return {
        items: [
          ...state.items,
          {
            cart_id: item.cart_id,
            product_id: item.product_id,
            vendor_id: item.vendor_id,
            vendor_name: item.vendor_name,
            name: item.name,
            price: item.price,
            image_url: item.image_url ?? null,
            max_stock: item.max_stock,
            quantity: quantity > item.max_stock ? item.max_stock : quantity,
          },
        ],
      };
    });
  },

  updateQuantity: (product_id, quantity) => {
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

  removeItem: (product_id) => {
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== product_id),
    }));
  },

  canAddItem: (product_id, addQty, maxStock) => {
    const { items } = get();
    const existing = items.find((i) => i.product_id === product_id);
    const currentQty = existing ? existing.quantity : 0;
    return currentQty + addQty <= maxStock;
  },

  clear: () => set({ items: [], isHydrated: true }),
}));
