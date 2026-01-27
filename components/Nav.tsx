'use client';

import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import CartBadge from '@/components/CartBadge';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-orange-600 tracking-tight"
            >
              BZMarket
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {/* ✅ UTILISE CartBadge au lieu du code manuel */}
            <CartBadge />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Mon Espace
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
