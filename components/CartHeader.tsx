'use client';

import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function CartHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Bouton retour + Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
            <span className="text-2xl font-bold text-orange-600 tracking-tight">
              BZMarket
            </span>
          </Link>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans le panier..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
              />
            </div>
          </div>

          {/* Lien Continuer mes achats */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </header>
  );
}
