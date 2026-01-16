'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    weight: number;
    stock: number;
    image_url: string | null;
    vendor_id: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, getItemQuantity, updateQuantity, canAddItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ AJOUTÉ pour gérer l'hydratation
  
  // ✅ ATTENDRE QUE LE COMPOSANT SOIT MONTÉ CÔTÉ CLIENT
  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentQuantity = getItemQuantity(product.id);
  const isInCart = currentQuantity > 0;

  const handleAddToCart = () => {
    if (!canAddItem(product.id, 1, product.stock)) {
      toast.error('Stock insuffisant');
      return;
    }

    setIsAdding(true);
    
    addItem({
      id: crypto.randomUUID(),
      product_id: product.id,
      vendor_id: product.vendor_id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      image_url: product.image_url,
      max_stock: product.stock,
    });

    toast.success('Produit ajouté au panier !', {
      icon: <Check className="w-4 h-4" />,
    });

    setTimeout(() => setIsAdding(false), 500);
  };

  const handleIncrement = () => {
    if (!canAddItem(product.id, 1, product.stock)) {
      toast.error('Stock maximum atteint');
      return;
    }
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1);
    } else {
      updateQuantity(product.id, 0);
      toast.info('Produit retiré du panier');
    }
  };

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
      >
        Rupture de stock
      </button>
    );
  }

  // ✅ AFFICHER UN LOADER PENDANT L'HYDRATATION
  if (!isClient) {
    return (
      <button
        disabled
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold opacity-50 flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        Ajouter au panier
      </button>
    );
  }

  if (isInCart) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center border-2 border-blue-600 rounded-lg">
          <button
            onClick={handleDecrement}
            className="px-4 py-3 hover:bg-blue-50 transition-colors"
          >
            <Minus className="w-5 h-5 text-blue-600" />
          </button>
          
          <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">
            {currentQuantity}
          </span>
          
          <button
            onClick={handleIncrement}
            className="px-4 py-3 hover:bg-blue-50 transition-colors"
            disabled={currentQuantity >= product.stock}
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </button>
        </div>
        
        <a
          href="/cart"
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
        >
          Voir le panier
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <ShoppingCart className="w-5 h-5" />
      {isAdding ? 'Ajout...' : 'Ajouter au panier'}
    </button>
  );
}
