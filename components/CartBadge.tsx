'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { loadUserCart } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CartBadge() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  // 🔁 remplace getTotalItems par un calcul local
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function init() {
      try {
        console.log('🔍 [CartBadge] Début chargement...');

        const { isAuth } = await checkAuth();
        console.log('🔍 [CartBadge] Auth:', isAuth);

        setIsAuthenticated(isAuth);

        if (isAuth) {
          console.log('🔍 [CartBadge] Appel loadUserCart()...');
          const result = await loadUserCart();

          console.log('🔍 [CartBadge] Résultat complet:', result);
          console.log('🔍 [CartBadge] result.success:', result.success);
          console.log('🔍 [CartBadge] result.items:', result.items);
          console.log(
            '🔍 [CartBadge] Nombre items reçus:',
            result.items?.length || 0
          );

          if (result.success && result.items) {
            console.log(
              '🔍 [CartBadge] ✅ Items reçus:',
              result.items.length
            );

            const zustandItems = useCartStore.getState().items;
            console.log(
              '🔍 [CartBadge] Items actuels dans Zustand:',
              zustandItems.length
            );
          } else {
            console.error('❌ [CartBadge] Erreur loadUserCart:', result.error);
          }
        } else {
          console.log('⚠️ [CartBadge] Utilisateur non authentifié');
        }

        setMounted(true);
        console.log('🔍 [CartBadge] Chargement terminé, mounted=true');
      } catch (error: any) {
        console.error('❌ [CartBadge] Exception:', error);
        console.error('❌ [CartBadge] Stack:', error.stack);
        setMounted(true);
      }
    }

    init();
  }, []);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour accéder au panier', {
        action: {
          label: 'Se connecter',
          onClick: () => router.push('/login?redirect=/cart'),
        },
      });

      setTimeout(() => {
        router.push('/login?redirect=/cart');
      }, 2000);

      return;
    }

    router.push('/cart');
  };

  if (!mounted) {
    return (
      <button
        onClick={handleClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
      </button>
    );
  }

  console.log(
    '🔍 [CartBadge] Render - cartCount:',
    cartCount,
    'items.length:',
    items.length
  );

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />

      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-md animate-in zoom-in duration-300">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
}
