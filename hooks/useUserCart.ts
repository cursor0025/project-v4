'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function useUserCart() {
  // On utilise l'action `clear` définie dans ton CartState
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Si aucun utilisateur connecté, on vide le panier local
      if (!user) {
        clear();
      }
    };

    checkUser();

    // Écoute les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clear]);
}
