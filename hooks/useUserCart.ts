'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function useUserCart() {
  // ⬅️ adapte le nom ici à celui de ton store (resetCart, clear, emptyCart, etc.)
  const resetCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Récupérer l'utilisateur actuel
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Si pas d'utilisateur connecté, vider le panier
      if (!user) {
        resetCart();
      }
    };

    checkUser();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        resetCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [resetCart]);
}
