'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartDB } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { ShoppingCart, Check, LogIn } from 'lucide-react';
import type { CartItem } from '@/store/cart';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    weight?: number;
    stock: number;
    image_url: string | null;
    vendor_id: string;
    vendor_name?: string;
    vendor_logo?: string | null;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const items = useCartStore((state) => state.items);
  const addItemLocally = useCartStore((state) => state.addItemLocally);
  const updateItemLocally = useCartStore((state) => state.updateItemLocally);
  const removeItemLocally = useCartStore((state) => state.removeItemLocally);

  useEffect(() => {
    async function verifyAuth() {
      const { isAuth } = await checkAuth();
      setIsAuthenticated(isAuth);
      setIsChecking(false);
    }
    verifyAuth();
  }, []);

  const redirectToLogin = () => {
    const currentUrl = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier', {
        icon: <LogIn className="w-4 h-4" />,
        action: {
          label: 'Se connecter',
          onClick: redirectToLogin,
        },
      });

      setTimeout(redirectToLogin, 2000);
      return;
    }

    if (product.stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    setIsAdding(true);

    const existingItem = items.find((item) => item.product_id === product.id);

    try {
      // ÉTAPE 1 : mettre à jour le store local immédiatement
      if (existingItem) {
        updateItemLocally(product.id, existingItem.quantity + 1);
      } else {
        const newItem: CartItem = {
          cart_id: undefined,
          product_id: product.id,
          vendor_id: product.vendor_id,
          vendor_name: product.vendor_name || 'Vendeur',
          vendor_logo: product.vendor_logo || null,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          max_stock: product.stock,
          quantity: 1,
        };
        addItemLocally(newItem);
      }

      // ÉTAPE 2 : sync Supabase
      const result = await addToCartDB(product.id, 1);

      if (result.requiresAuth) {
        toast.error('Session expirée, reconnectez-vous', {
          icon: <LogIn className="w-4 h-4" />,
        });
        redirectToLogin();
        return;
      }

      if (!result.success) {
        // rollback si échec côté Supabase
        if (existingItem) {
          updateItemLocally(product.id, existingItem.quantity);
        } else {
          removeItemLocally(product.id);
        }
        toast.error(result.error || "Erreur lors de l'ajout au panier");
        return;
      }

      toast.success(result.message || 'Produit ajouté au panier !', {
        icon: <Check className="w-4 h-4" />,
        action: {
          label: 'Voir le panier',
          onClick: () => router.push('/cart'),
        },
      });
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      // rollback en cas d’exception
      if (existingItem) {
        updateItemLocally(product.id, existingItem.quantity);
      } else {
        removeItemLocally(product.id);
      }
      toast.error('Une erreur est survenue');
    } finally {
      setIsAdding(false);
    }
  };

  if (isChecking) {
    return (
      <button
        disabled
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold opacity-50 flex items-center justify-center gap-2"
      >
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Vérification...
      </button>
    );
  }

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

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isAdding ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Ajout en cours...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Ajouter au panier
        </>
      )}
    </button>
  );
}
