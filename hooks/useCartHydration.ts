'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { loadUserCart } from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';

export function useCartHydration() {
  const isHydrated = useCartStore((state) => state.isHydrated);
  const setItems = useCartStore((state) => state.setItems);
  const setLoading = useCartStore((state) => state.setLoading);
  const setHydrated = useCartStore((state) => state.setHydrated);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isHydrated || hasFetched) return;

    async function init() {
      setLoading(true);
      setHasFetched(true);

      const { isAuth } = await checkAuth();
      if (!isAuth) {
        setLoading(false);
        setHydrated(true);
        return;
      }

      const result = await loadUserCart();

      if (result.success) {
        setItems(result.items || []);
      }

      setLoading(false);
      setHydrated(true);
    }

    init();
  }, [isHydrated, hasFetched, setItems, setLoading, setHydrated]);
}
