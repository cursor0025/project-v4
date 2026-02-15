'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ✅ NOUVEAU : Type pour les variantes
export type ProductVariant = {
  color: string;
  size: string;
  sku: string;
};

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
  variant?: ProductVariant; // ✅ NOUVEAU : Optionnel (uniquement pour vêtements)
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

  // setters généraux
  setItems: (items: CartItem[]) => void;
  setHydrated: (value: boolean) => void;
  setLoading: (value: boolean) => void;

  // dérivés
  itemsByVendor: () => Record<string, CartItem[]>;
  getVendors: () => VendorCart[];

  // mutations locales
  addItemLocally: (item: CartItem) => void;
  updateItemLocally: (product_id: string, quantity: number, variant?: ProductVariant) => void;
  removeItemLocally: (product_id: string, variant?: ProductVariant) => void;
  clear: () => void;
};

// ✅ NOUVEAU : Helper pour comparer 2 variantes
function variantsMatch(v1?: ProductVariant, v2?: ProductVariant): boolean {
  if (!v1 && !v2) return true; // Pas de variantes = même produit
  if (!v1 || !v2) return false; // Une seule a une variante = différent
  return v1.color === v2.color && v1.size === v2.size;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      isLoading: false,

      // remplace tout le panier (après Supabase ou local)
      setItems: (items) => {
        set({
          items,
          isHydrated: true,
          isLoading: false,
        });
      },

      // ✅ MODIFIÉ : ajoute ou incrémente un item (avec support variantes)
      addItemLocally: (item) => {
        set((state) => {
          // Cherche un item existant avec MÊME product_id ET MÊME variante
          const existing = state.items.find(
            (i) =>
              i.product_id === item.product_id &&
              variantsMatch(i.variant, item.variant)
          );

          if (existing) {
            // Incrémente la quantité
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id &&
                variantsMatch(i.variant, item.variant)
                  ? {
                      ...i,
                      quantity:
                        i.quantity + item.quantity > i.max_stock
                          ? i.max_stock
                          : i.quantity + item.quantity,
                    }
                  : i
              ),
            };
          }

          // Ajoute un nouvel item
          return {
            items: [...state.items, item],
          };
        });
      },

      // items groupés par vendeur (record)
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

      // tableau de vendeurs avec sous‑total
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

      // ✅ MODIFIÉ : met à jour la quantité (avec support variantes)
      updateItemLocally: (product_id, quantity, variant) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  !(
                    i.product_id === product_id &&
                    variantsMatch(i.variant, variant)
                  )
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product_id === product_id &&
              variantsMatch(item.variant, variant)
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

      // ✅ MODIFIÉ : supprime un produit (avec support variantes)
      removeItemLocally: (product_id, variant) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.product_id === product_id &&
                variantsMatch(i.variant, variant)
              )
          ),
        }));
      },

      // vide le panier
      clear: () =>
        set({
          items: [],
          isHydrated: true,
          isLoading: false,
        }),

      setHydrated: (value) => set({ isHydrated: value }),
      setLoading: (value) => set({ isLoading: value }),
    }),
    {
      // clé localStorage
      name: 'cart-storage',
    }
  )
);
