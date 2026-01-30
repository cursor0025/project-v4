'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import FilterBar from './FilterBar';

type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'popular';
type PriceType = 'fixe' | 'negociable' | 'facilite';

interface CurrentFilters {
  wilaya?: string;
  etat?: string;
  priceType?: PriceType;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
}

interface ProductGridProps {
  products: Product[] | null | undefined;
  isLoading?: boolean;
  currentFilters: CurrentFilters;
  onFilterChange: (patch: Partial<CurrentFilters>) => void;
}

export default function ProductGrid({
  products,
  isLoading = false,
  currentFilters,
  onFilterChange,
}: ProductGridProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse">
          <div className="h-20 bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(10)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="space-y-8">
        <FilterBar
          current={currentFilters}
          onChange={onFilterChange}
          totalProducts={0}
        />

        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-400 mb-6">
            Essayez de modifier vos filtres pour voir plus de résultats
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FilterBar
        current={currentFilters}
        onChange={onFilterChange}
        totalProducts={safeProducts.length}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {safeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
