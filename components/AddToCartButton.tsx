'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartDB } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';
import { toast } from 'sonner';
import { ShoppingCart, Check, LogIn } from 'lucide-react';

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

  // Vérifier l'authentification au montage
  useEffect(() => {
    async function verifyAuth() {
      const { isAuth } = await checkAuth();
      setIsAuthenticated(isAuth);
      setIsChecking(false);
    }
    verifyAuth();
  }, []);

  const handleAddToCart = async () => {
    // ✅ Vérifier l'auth avant d'ajouter
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier', {
        icon: <LogIn className="w-4 h-4" />,
        action: {
          label: 'Se connecter',
          onClick: () => {
            const currentUrl = window.location.pathname;
            router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          },
        },
      });
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        const currentUrl = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }, 2000);
      
      return;
    }

    // Vérifier le stock
    if (product.stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    setIsAdding(true);

    try {
      // ✅ Appeler l'action serveur Supabase
      const result = await addToCartDB(product.id, 1);

      if (result.requiresAuth) {
        toast.error('Session expirée, reconnectez-vous', {
          icon: <LogIn className="w-4 h-4" />,
        });
        const currentUrl = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de l\'ajout au panier');
        return;
      }

      // ✅ Succès
      toast.success(result.message || 'Produit ajouté au panier !', {
        icon: <Check className="w-4 h-4" />,
        action: {
          label: 'Voir le panier',
          onClick: () => router.push('/cart'),
        },
      });

      // Rafraîchir pour mettre à jour le badge panier
      router.refresh();

    } catch (error) {
      console.error('Erreur ajout panier:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsAdding(false);
    }
  };

  // État de chargement initial
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

  // Produit en rupture de stock
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

  // Bouton principal
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
