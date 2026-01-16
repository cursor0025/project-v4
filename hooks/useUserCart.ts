'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function useUserCart() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Récupérer l'utilisateur actuel
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si pas d'utilisateur connecté, vider le panier
      if (!user) {
        clearCart();
      }
    };

    checkUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearCart]);
}
