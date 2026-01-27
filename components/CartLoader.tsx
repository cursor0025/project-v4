'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { loadUserCart } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';

export default function CartLoader() {
  useEffect(() => {
    async function loadCart() {
      // Vérifier l'auth d'abord
      const { isAuth } = await checkAuth();
      
      if (!isAuth) {
        // Si pas connecté, vider le store
        useCartStore.getState().setItems([]);
        return;
      }

      // Charger depuis Supabase
      const result = await loadUserCart();
      
      if (result.success && result.items) {
        console.log('🔥 CartLoader: Chargement de', result.items.length, 'items');
        useCartStore.getState().setItems(result.items);
      } else {
        console.log('❌ CartLoader: Échec du chargement', result.error);
      }
    }

    // Petit délai pour laisser Supabase s'initialiser
    const timer = setTimeout(() => {
      loadCart();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
