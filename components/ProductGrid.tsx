'use client';

import { useState, useMemo } from 'react';
import { Product, ProductFilters } from '@/types/product';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import FilterBar from './FilterBar';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'newest'
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by wilaya
    if (filters.wilaya) {
      result = result.filter(p => 
        p.metadata?.wilaya?.toLowerCase() === filters.wilaya?.toLowerCase()
      );
    }

    // Filter by état
    if (filters.etat) {
      result = result.filter(p => 
        p.metadata?.etat?.toLowerCase().includes(filters.etat?.toLowerCase() || '')
      );
    }

    // Filter by price type
    if (filters.priceType) {
      result = result.filter(p => p.price_type === filters.priceType);
    }

    // Filter by price range
    if (filters.minPrice) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [products, filters]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse">
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
        {/* GRILLE DE 5 COLONNES */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(10)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <FilterBar 
        filters={filters}
        onFilterChange={setFilters}
        totalProducts={filteredProducts.length}
      />

      {/* Products Grid - 5 COLONNES avec espacement optimisé */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-6">
            Essayez de modifier vos filtres pour voir plus de résultats
          </p>
          <button
            onClick={() => setFilters({ sortBy: 'newest' })}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
