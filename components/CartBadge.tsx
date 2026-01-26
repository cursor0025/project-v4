'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCartCount } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CartBadge() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCartData() {
      try {
        // Vérifier l'authentification
        const { isAuth } = await checkAuth();
        setIsAuthenticated(isAuth);

        // Si connecté, charger le compteur
        if (isAuth) {
          const result = await getCartCount();
          if (result.success) {
            setCartCount(result.count);
          }
        }
      } catch (error) {
        console.error('Erreur chargement badge panier:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCartData();

    // Rafraîchir toutes les 5 secondes si connecté
    const interval = setInterval(() => {
      if (isAuthenticated) {
        loadCartData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleClick = () => {
    // ✅ Vérifier l'auth avant d'accéder au panier
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour accéder au panier', {
        action: {
          label: 'Se connecter',
          onClick: () => router.push('/login?redirect=/cart'),
        },
      });

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/login?redirect=/cart');
      }, 2000);

      return;
    }

    // Si connecté, aller au panier
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-50"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
      
      {/* Badge de compteur (uniquement si connecté et > 0) */}
      {isAuthenticated && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
}
