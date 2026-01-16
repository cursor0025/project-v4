import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  price: number;
  quantity: number;
  weight: number;
  image_url: string | null;
  max_stock: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearVendorItems: (vendorId: string) => void;
  getItemQuantity: (productId: string) => number;
  canAddItem: (productId: string, requestedQty: number, maxStock: number) => boolean;
  getVendorItems: (vendorId: string) => CartItem[];
  getVendorTotal: (vendorId: string) => number;
  getVendorWeight: (vendorId: string) => number;
  getGroupedByVendor: () => Record<string, CartItem[]>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalWeight: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product_id === newItem.product_id);
          if (existingItem) {
            const newQuantity = existingItem.quantity + 1;
            if (newQuantity > newItem.max_stock) {
              console.warn('Stock insuffisant');
              return state;
            }
            return {
              items: state.items.map((item) =>
                item.product_id === newItem.product_id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product_id === productId) {
              const newQty = Math.min(quantity, item.max_stock);
              return { ...item, quantity: newQty };
            }
            return item;
          }),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      clearVendorItems: (vendorId) => {
        set((state) => ({
          items: state.items.filter((item) => item.vendor_id !== vendorId),
        }));
      },
      
      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product_id === productId);
        return item ? item.quantity : 0;
      },
      
      canAddItem: (productId, requestedQty, maxStock) => {
        const currentQty = get().getItemQuantity(productId);
        return currentQty + requestedQty <= maxStock;
      },
      
      getVendorItems: (vendorId) => {
        return get().items.filter((item) => item.vendor_id === vendorId);
      },
      
      getVendorTotal: (vendorId) => {
        const vendorItems = get().getVendorItems(vendorId);
        return vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      getVendorWeight: (vendorId) => {
        const vendorItems = get().getVendorItems(vendorId);
        return vendorItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
      },
      
      getGroupedByVendor: () => {
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
      
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      getTotalWeight: () => {
        return get().items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
      },
    }),
    {
      name: 'bzmarket-cart-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
