import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export interface CartItem {
  id: string;
  product_id: string; // ✅ AJOUTÉ pour identifier le produit
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  vendor_id: string;
  weight: number;
  max_stock: number; // ✅ AJOUTÉ pour vérifier le stock
}


interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  canAddItem: (productId: string, quantityToAdd: number, maxStock: number) => boolean; // ✅ AJOUTÉ
  getTotalItems: () => number;
  getTotalPrice: () => number;
}


export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],


      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.product_id === item.product_id);


        if (existingItem) {
          set({
            items: items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },


      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product_id !== productId) });
      },


      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        });
      },


      clearCart: () => {
        set({ items: [] });
      },


      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product_id === productId);
        return item ? item.quantity : 0;
      },


      // ✅ FONCTION AJOUTÉE - Vérifie si on peut ajouter au panier
      canAddItem: (productId, quantityToAdd, maxStock) => {
        const currentQuantity = get().getItemQuantity(productId);
        return currentQuantity + quantityToAdd <= maxStock;
      },


      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },


      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
