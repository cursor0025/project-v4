import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface CartItem {
  id: string;
  product_id: string;
  vendor_id: string;
  name: string;
  price: number;
  quantity: number;
  weight: number; // en kg
  image_url: string | null;
  max_stock: number;
}

export interface ShippingOption {
  provider_id: string;
  provider_name: string;
  provider_slug: string;
  delivery_type: 'home' | 'office'; // domicile ou stop desk
  price: number;
  delivery_days_min: number;
  delivery_days_max: number;
  estimated_delivery: string;
}

export interface CartState {
  // État
  items: CartItem[];
  wilaya: string | null;
  selectedShipping: ShippingOption | null;
  promoCode: string | null;
  promoDiscount: number;
  
  // Computed values
  subtotal: number;
  shippingCost: number;
  total: number;
  totalWeight: number;
  itemCount: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  setWilaya: (wilaya: string) => void;
  setShipping: (shipping: ShippingOption | null) => void;
  setPromoCode: (code: string | null, discount: number) => void;
  
  // Helpers
  getItemQuantity: (productId: string) => number;
  canAddItem: (productId: string, requestedQty: number, maxStock: number) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // État initial
      items: [],
      wilaya: null,
      selectedShipping: null,
      promoCode: null,
      promoDiscount: 0,
      
      // Computed values (se recalculent automatiquement)
      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      get shippingCost() {
        const { selectedShipping, totalWeight } = get();
        if (!selectedShipping) return 0;
        
        // Calculer le coût avec supplément poids si applicable
        let cost = selectedShipping.price;
        
        // Si le transporteur a un système de poids (comme ZR Express)
        // On vérifiera ça plus tard avec les données du provider
        
        return cost;
      },
      
      get total() {
        const { subtotal, shippingCost, promoDiscount } = get();
        return Math.max(0, subtotal + shippingCost - promoDiscount);
      },
      
      get totalWeight() {
        return get().items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
      },
      
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      // Actions
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product_id === newItem.product_id);
          
          if (existingItem) {
            // Incrémenter la quantité
            const newQuantity = existingItem.quantity + 1;
            
            // Vérifier le stock
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
          
          // Ajouter un nouveau produit
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: 1,
              },
            ],
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
              // Vérifier le stock
              const newQty = Math.min(quantity, item.max_stock);
              return { ...item, quantity: newQty };
            }
            return item;
          }),
        }));
      },
      
      clearCart: () => {
        set({
          items: [],
          wilaya: null,
          selectedShipping: null,
          promoCode: null,
          promoDiscount: 0,
        });
      },
      
      setWilaya: (wilaya) => {
        set({ 
          wilaya,
          // Reset shipping si on change de wilaya
          selectedShipping: null,
        });
      },
      
      setShipping: (shipping) => {
        set({ selectedShipping: shipping });
      },
      
      setPromoCode: (code, discount) => {
        set({ 
          promoCode: code,
          promoDiscount: discount,
        });
      },
      
      // Helpers
      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product_id === productId);
        return item ? item.quantity : 0;
      },
      
      canAddItem: (productId, requestedQty, maxStock) => {
        const currentQty = get().getItemQuantity(productId);
        return currentQty + requestedQty <= maxStock;
      },
    }),
    {
      name: 'bzmarket-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
