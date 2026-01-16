import { create } from 'zustand';
import { 
  loadCartFromDB, 
  addToCartDB, 
  updateCartQuantityDB, 
  removeFromCartDB, 
  clearCartDB,
  clearVendorCartDB 
} from '@/lib/cart-helpers';

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
  userId: string | null;
  isLoaded: boolean;
  
  // Actions
  setUserId: (userId: string | null) => void;
  loadCart: (userId: string) => Promise<void>;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearVendorItems: (vendorId: string) => Promise<void>;
  
  // Helpers
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  userId: null,
  isLoaded: false,
  
  setUserId: (userId) => {
    set({ userId });
    if (userId) {
      get().loadCart(userId);
    } else {
      set({ items: [], isLoaded: true });
    }
  },
  
  loadCart: async (userId) => {
    const items = await loadCartFromDB(userId);
    set({ items, isLoaded: true });
  },
  
  addItem: async (newItem) => {
    const { userId } = get();
    if (!userId) {
      console.warn('Utilisateur non connecté');
      return;
    }
    
    await addToCartDB(userId, newItem);
    await get().loadCart(userId);
  },
  
  removeItem: async (productId) => {
    const { userId } = get();
    if (!userId) return;
    
    await removeFromCartDB(userId, productId);
    await get().loadCart(userId);
  },
  
  updateQuantity: async (productId, quantity) => {
    const { userId } = get();
    if (!userId) return;
    
    await updateCartQuantityDB(userId, productId, quantity);
    await get().loadCart(userId);
  },
  
  clearCart: async () => {
    const { userId } = get();
    if (!userId) return;
    
    await clearCartDB(userId);
    set({ items: [] });
  },
  
  clearVendorItems: async (vendorId) => {
    const { userId } = get();
    if (!userId) return;
    
    await clearVendorCartDB(userId, vendorId);
    await get().loadCart(userId);
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
}));
